import json
import asyncio
from http.server import BaseHTTPRequestHandler
from typing import Dict, Any, List

# Try importing arkprts, or provide helpful error if not yet installed
try:
    import arkprts
except ImportError:
    arkprts = None


async def fetch_arkprts_data(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Authenticates with Arknights game servers using arkprts and fetches:
    - User Profile & Doctor info
    - Gacha resources & pull calculations (Orundum, Originite Prime, Permits)
    - Inventory (Depot materials, currencies, chips)
    - Roster (Operators, Elite levels, masteries, potentials, modules)
    """
    if arkprts is None:
        raise RuntimeError("arkprts library is not installed in the environment. Please run: pip install arkprts")

    server = payload.get("server", "en").lower()
    auth_type = payload.get("auth_type", "token").lower()
    uid = payload.get("uid")
    token = payload.get("token")
    email = payload.get("email")
    code = payload.get("code")

    # 1. Initialize Authentication Handler
    auth = None
    if server in ["en", "jp", "kr"]:
        auth = arkprts.YostarAuth(server)

        if auth_type == "email_code" or (email and code):
            if not email or not code:
                raise ValueError("Both 'email' and verification 'code' are required for email_code login.")
            await auth.login_with_email_code(email, code)

        elif auth_type == "token" or (uid and token):
            if not uid or not token:
                raise ValueError("Both 'uid' and 'token' are required for token login.")
            await auth.login_with_token(str(uid), str(token))

        elif token:
            # Single auth token login
            await auth.login_with_token("", str(token))
        else:
            raise ValueError("Missing login credentials. Provide either (email + code) or (uid + token).")

    elif server in ["cn", "bili"]:
        # Hypergryph / Bilibili CN server
        if hasattr(arkprts, "HgAuth"):
            auth = arkprts.HgAuth(server)
            if token:
                await auth.login_with_token(str(token))
            else:
                raise ValueError("Token is required for CN server authentication.")
        else:
            raise ValueError("CN server authentication is not supported by this version of arkprts.")
    else:
        raise ValueError(f"Unsupported server: {server}. Supported servers: 'en', 'jp', 'kr', 'cn'")

    # 2. Instantiate Client (assets=False to optimize serverless performance & avoid downloading GBs)
    client = arkprts.Client(auth=auth, server=server, assets=False)

    # 3. Retrieve Player & Account Data
    data = await client.get_data()

    # 4. Extract Doctor Profile
    status = getattr(data, "status", None)
    profile = {
        "uid": getattr(status, "uid", uid or ""),
        "nickname": getattr(status, "nick_name", getattr(status, "nickname", "Doctor")),
        "level": getattr(status, "level", 1),
        "server": server.upper(),
        "resume": getattr(status, "resume", ""),
        "secretary": getattr(status, "secretary", ""),
    }

    # 5. Extract Currencies & Calculate Gacha Pulls
    orundum = getattr(status, "diamond_shard", 0) or 0
    pay_prime = getattr(status, "pay_diamond", 0) or 0
    free_prime = getattr(status, "free_diamond", 0) or 0
    originite_prime = pay_prime + free_prime
    lmd = getattr(status, "gold", 0) or 0

    # 6. Extract Depot Inventory
    # arkprts data contains inventory in data.inventory or data.user.inventory
    raw_inventory = getattr(data, "inventory", {}) or getattr(getattr(data, "user", None), "inventory", {})
    if hasattr(raw_inventory, "dict"):
        raw_inventory = raw_inventory.dict()
    elif not isinstance(raw_inventory, dict):
        raw_inventory = dict(raw_inventory)

    clean_inventory: Dict[str, int] = {}
    for item_id, count in raw_inventory.items():
        try:
            val = int(count)
            if val > 0:
                clean_inventory[str(item_id)] = val
        except (ValueError, TypeError):
            continue

    # Add primary currencies to inventory if not already present
    clean_inventory["4001"] = lmd
    clean_inventory["orundum"] = orundum
    clean_inventory["originite_prime"] = originite_prime

    # Permits:
    # 7001 = Single Headhunting Permit
    # 7002 = Ten-roll Headhunting Permit
    single_permits = clean_inventory.get("7001", 0)
    ten_permits = clean_inventory.get("7002", 0)

    # Standard Arknights math: 600 Orundum = 1 pull; 1 OP = 180 Orundum
    pulls_from_orundum = orundum // 600
    pulls_from_permits = single_permits + (ten_permits * 10)
    pulls_from_op = (originite_prime * 180) // 600

    gacha_summary = {
        "orundum": orundum,
        "originite_prime": originite_prime,
        "single_permits": single_permits,
        "ten_permits": ten_permits,
        "lmd": lmd,
        "pulls_without_op": pulls_from_orundum + pulls_from_permits,
        "pulls_with_op": pulls_from_orundum + pulls_from_permits + pulls_from_op,
    }

    # 7. Extract Operator Roster
    troop = getattr(data, "troop", None)
    raw_chars = getattr(troop, "chars", {}) if troop else {}
    if hasattr(raw_chars, "values"):
        char_list = list(raw_chars.values())
    elif isinstance(raw_chars, list):
        char_list = raw_chars
    else:
        char_list = []

    roster: List[Dict[str, Any]] = []
    for char in char_list:
        char_id = getattr(char, "char_id", "") or getattr(char, "id", "")
        if not char_id:
            continue

        elite = getattr(char, "evolve_phase", 0) or 0
        level = getattr(char, "level", 1) or 1
        potential = (getattr(char, "potential_rank", 0) or 0) + 1
        main_skill = getattr(char, "main_skill_lvl", 1) or 1
        favor_percent = getattr(char, "favor_percent", 0) or 0

        # Skill masteries: list of skill objects with specialize_level
        skills_raw = getattr(char, "skills", []) or []
        masteries: Dict[str, int] = {}
        for s in skills_raw:
            s_id = getattr(s, "skill_id", "") or (s.get("skill_id") if isinstance(s, dict) else "")
            spec = getattr(s, "specialize_level", 0) or (s.get("specialize_level", 0) if isinstance(s, dict) else 0)
            if s_id and spec > 0:
                masteries[s_id] = spec

        # Modules / Equipments: dict of { equip_id: { level: 1-3 } }
        equip_raw = getattr(char, "equip", {}) or {}
        modules: Dict[str, int] = {}
        if isinstance(equip_raw, dict):
            for eq_id, eq_data in equip_raw.items():
                eq_lvl = getattr(eq_data, "level", 0) or (eq_data.get("level", 0) if isinstance(eq_data, dict) else 0)
                if eq_lvl > 0:
                    modules[eq_id] = eq_lvl

        roster.append({
            "operator_id": char_id,
            "elite": elite,
            "level": level,
            "potential": potential,
            "skill_level": main_skill,
            "masteries": masteries,
            "modules": modules,
            "favor_percent": favor_percent,
        })

    return {
        "success": True,
        "profile": profile,
        "gacha": gacha_summary,
        "inventory": clean_inventory,
        "roster": roster,
        "total_operators": len(roster),
    }


class handler(BaseHTTPRequestHandler):
    """
    Vercel Serverless Function HTTP Handler.
    """

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        # Health check endpoint
        response = {
            "service": "ArkCalc PRTS Sync Serverless",
            "status": "ready",
            "runtime": "Vercel Python Serverless",
            "documentation": "Send POST request with JSON payload: { 'server': 'en', 'uid': '...', 'token': '...' }",
        }
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(response).encode("utf-8"))

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                raise ValueError("Empty request body. JSON payload is required.")

            body = self.rfile.read(content_length)
            payload = json.loads(body.decode("utf-8"))

            # Run async arkprts worker
            result = asyncio.run(fetch_arkprts_data(payload))

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(result, ensure_ascii=False).encode("utf-8"))

        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": "Invalid JSON format"}).encode("utf-8"))

        except Exception as err:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": str(err)}).encode("utf-8"))
