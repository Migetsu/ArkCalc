import operatorsData from '~/assets/data/operators.json'
import type { OperatorData } from '~/types'

export default defineEventHandler((event) => {
  // Set long-lived client cache headers with revalidation allowance
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
    'Content-Type': 'application/json',
  })

  return operatorsData as OperatorData[]
})
