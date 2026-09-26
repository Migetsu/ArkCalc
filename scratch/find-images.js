async function checkRealMaterials() {
  const base = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel";
  const items = (await (await fetch(`${base}/item_table.json`)).json()).items;

  const testList = [
    // T1-T5
    "30011", "30012", "30013", "30014", // Orirock
    "30021", "30022", "30023", "30024", // Sugar
    "30061", "30062", "30063", "30064", // Device
    "30145", "30155", "30135", "30125", "30115", // T5 mats
    // Chips
    "3211", "3212", "3213", "32001",
    // Skill books
    "3301", "3302", "3303",
    // Modules
    "mod_unlock_token", "mod_update_token_1", "mod_update_token_2",
    // Exp & Gold
    "2001", "2002", "2003", "2004", "4001"
  ];

  for (const id of testList) {
    const it = items[id];
    if (!it) {
      console.log(`Item ${id} NOT FOUND in item_table!`);
      continue;
    }
    const iconId = it.iconId || id;
    const url1 = `https://raw.githubusercontent.com/yuanyan3060/Arknights-Bot-Resource/main/item/${iconId}.png`;
    const url2 = `https://raw.githubusercontent.com/Aceship/Arknight-Images/main/items/${iconId}.png`;
    const res1 = await fetch(url1, { method: "HEAD" });
    const res2 = await fetch(url2, { method: "HEAD" });
    console.log(id, it.name, "iconId:", iconId, "yuanyan:", res1.status, "aceship:", res2.status);
  }
}
checkRealMaterials();
