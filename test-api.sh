#!/usr/bin/env bash
# Lane Master — API Test Suite
# Run this after: npm run dev
# Usage: bash test-api.sh

BASE="http://localhost:3000"
PASS=0
FAIL=0

green='\033[0;32m'
red='\033[0;31m'
cyan='\033[0;36m'
reset='\033[0m'

check() {
  local label="$1"
  local output="$2"
  local expect="$3"
  if echo "$output" | grep -q "$expect"; then
    echo -e "${green}✅ PASS${reset} — $label"
    PASS=$((PASS+1))
  else
    echo -e "${red}❌ FAIL${reset} — $label"
    echo "   Expected to find: $expect"
    echo "   Got: $(echo $output | head -c 200)"
    FAIL=$((FAIL+1))
  fi
}

echo ""
echo -e "${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}"
echo -e "${cyan}  Lane Master API Test Suite${reset}"
echo -e "${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}"
echo ""

# ── 1. Root page ────────────────────────────────
echo -e "${cyan}[ App ]${reset}"
OUT=$(curl -s -o /dev/null -w "%{http_code}" $BASE/)
check "GET / — app loads" "$OUT" "200"

# ── 2. Register ─────────────────────────────────
echo ""
echo -e "${cyan}[ Auth ]${reset}"
EMAIL="test_$(date +%s)@lanemasterapp.com"

REGISTER=$(curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"bowling123\",\"name\":\"Test Bowler\"}")
check "POST /api/auth/register — creates user" "$REGISTER" "token"

TOKEN=$(echo $REGISTER | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# ── 3. Login ────────────────────────────────────
LOGIN=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"bowling123\"}")
check "POST /api/auth/login — returns token" "$LOGIN" "token"

# ── 4. Wrong password ───────────────────────────
BADLOGIN=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"wrongpass\"}")
check "POST /api/auth/login — rejects bad password (401)" "$BADLOGIN" "401"

# ── 5. /me ──────────────────────────────────────
ME=$(curl -s $BASE/api/auth/me -H "Authorization: Bearer $TOKEN")
check "GET /api/auth/me — returns user" "$ME" "\"email\""

UNAUTH=$(curl -s -o /dev/null -w "%{http_code}" $BASE/api/auth/me)
check "GET /api/auth/me — rejects no token (401)" "$UNAUTH" "401"

# ── 6. Games ────────────────────────────────────
echo ""
echo -e "${cyan}[ Games ]${reset}"
SAVE=$(curl -s -X POST $BASE/api/games \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "totalScore": 187,
    "ballUsed": "Phaze II",
    "frames": [
      {"ball1":"X","ball2":"","ball3":"","note":"Strike!"},
      {"ball1":"7","ball2":"/","ball3":"","note":""},
      {"ball1":"X","ball2":"","ball3":"","note":""},
      {"ball1":"X","ball2":"","ball3":"","note":""},
      {"ball1":"9","ball2":"/","ball3":"","note":""},
      {"ball1":"X","ball2":"","ball3":"","note":""},
      {"ball1":"8","ball2":"1","ball3":"","note":"Missed spare"},
      {"ball1":"X","ball2":"","ball3":"","note":""},
      {"ball1":"X","ball2":"","ball3":"","note":""},
      {"ball1":"X","ball2":"9","ball3":"/","note":""}
    ]
  }')
check "POST /api/games — saves game (score 187)" "$SAVE" "187"
GAME_ID=$(echo $SAVE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

GAMES=$(curl -s $BASE/api/games -H "Authorization: Bearer $TOKEN")
check "GET /api/games — returns game list" "$GAMES" "Phaze II"

GET_ONE=$(curl -s $BASE/api/games/$GAME_ID -H "Authorization: Bearer $TOKEN")
check "GET /api/games/:id — returns single game" "$GET_ONE" "187"

DELETE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  $BASE/api/games/$GAME_ID -H "Authorization: Bearer $TOKEN")
check "DELETE /api/games/:id — deletes game" "$DELETE" "200"

# ── 7. Preferences ──────────────────────────────
echo ""
echo -e "${cyan}[ Preferences ]${reset}"
PREFS=$(curl -s -X PUT $BASE/api/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"bowlingStyle":"twohand","skillLevel":"advanced","favoriteBrands":["Storm","Motiv"]}')
check "PUT /api/preferences — saves prefs" "$PREFS" "twohand"

GET_PREFS=$(curl -s $BASE/api/preferences -H "Authorization: Bearer $TOKEN")
check "GET /api/preferences — returns prefs" "$GET_PREFS" "advanced"

# ── 8. Ball Notes ───────────────────────────────
echo ""
echo -e "${cyan}[ Ball Notes ]${reset}"
NOTE=$(curl -s -X POST $BASE/api/ball-notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ballName":"Phaze II","brand":"Storm","rating":5,"notes":"Absolutely love this ball on heavy oil."}')
check "POST /api/ball-notes — saves note" "$NOTE" "Phaze II"
NOTE_ID=$(echo $NOTE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

NOTES=$(curl -s $BASE/api/ball-notes -H "Authorization: Bearer $TOKEN")
check "GET /api/ball-notes — returns notes" "$NOTES" "Phaze II"

DEL_NOTE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  $BASE/api/ball-notes/$NOTE_ID -H "Authorization: Bearer $TOKEN")
check "DELETE /api/ball-notes/:id — deletes note" "$DEL_NOTE" "200"

# ── 9. Coach (no API key) ───────────────────────
echo ""
echo -e "${cyan}[ AI Routes ]${reset}"
COACH=$(curl -s -X POST $BASE/api/coach \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"messages":[{"role":"user","content":"How do I improve my release?"}],"bowlingStyle":"onehand","skillLevel":"beginner"}')
check "POST /api/coach — responds (key or no key)" "$COACH" "reply"

FORM=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/analyze-form \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"imageBase64":"fake","analyzeMode":"solo"}')
check "POST /api/analyze-form — responds (503 without key is ok)" "$FORM" "503\|200"

# ── Summary ─────────────────────────────────────
echo ""
echo -e "${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}"
echo -e "  Results: ${green}$PASS passed${reset}  ${red}$FAIL failed${reset}"
echo -e "${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}"
echo ""
