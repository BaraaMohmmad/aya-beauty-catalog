// app/api/admin/utils/tokens.ts
let tokens = new Set<string>()

export function addToken(token: string) {
  tokens.add(token)
}

export function hasToken(token: string) {
  return tokens.has(token)
}
