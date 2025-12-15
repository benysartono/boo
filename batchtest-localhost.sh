#!/bin/bash

# =======================================================
# BOO API MANUAL TEST (Linux/macOS Version - Replit)
# =======================================================

# BASEURL="https://8a474806-c0fe-45f5-ab95-b14e8bbc296d-00-14b3k6ql2q1ci.sisko.replit.dev/boo"
BASEURL="${BASEURL:-http://localhost:3000/boo}"


clear
echo "==========================================="
echo " BOO API MANUAL TEST (CREATE / VOTE / SORT / FILTER)"
echo " Using endpoint: $BASEURL"
echo "==========================================="
echo

read -p "Enter PROFILE_ID (leave blank to create one now): " PROFILE_ID
read -p "Enter USER_ID (leave blank to create one now): " USER_ID
read -p "Enter SECOND_USER_ID (optional): " SECOND_USER_ID
echo

# -----------------------------------------
# CREATE PROFILE IF EMPTY
# -----------------------------------------
if [ -z "$PROFILE_ID" ]; then
  echo "[1] Creating PROFILE..."
  curl -s -X POST "$BASEURL/profiles" \
    -H "Content-Type: application/json" \
    -d '{"name":"BatchTester","title":"QA","description":"Auto created"}'
  echo
  read -p "Paste PROFILE_ID: " PROFILE_ID
fi

# -----------------------------------------
# CREATE USER IF EMPTY
# -----------------------------------------
if [ -z "$USER_ID" ]; then
  echo "[2] Creating USER..."
  curl -s -X POST "$BASEURL/users" \
    -H "Content-Type: application/json" \
    -d '{"name":"BatchUser"}'
  echo
  read -p "Paste USER_ID: " USER_ID
fi

# -----------------------------------------
# OPTIONAL SECOND USER
# -----------------------------------------
if [ -z "$SECOND_USER_ID" ]; then
  read -p "Create second user? (y/n): " yn
  if [[ "$yn" == "y" || "$yn" == "Y" ]]; then
    echo "[3] Creating SECOND USER..."
    curl -s -X POST "$BASEURL/users" \
      -H "Content-Type: application/json" \
      -d '{"name":"SecondUser"}'
    echo
    read -p "Paste SECOND_USER_ID: " SECOND_USER_ID
  fi
fi

echo
echo "PROFILE_ID: $PROFILE_ID"
echo "USER_ID: $USER_ID"
echo "SECOND_USER_ID: $SECOND_USER_ID"
echo

# -----------------------------------------
# CREATE COMMENT
# -----------------------------------------
echo "[4] Creating comment..."
curl -s -X POST "$BASEURL/comments" \
  -H "Content-Type: application/json" \
  -d "{\"profileId\":\"$PROFILE_ID\",\"userId\":\"$USER_ID\",\"text\":\"Hello from shell script\"}"
echo
read -p "Paste COMMENT_ID: " COMMENT_ID

# -----------------------------------------
# REPLY
# -----------------------------------------
echo "[5] Replying..."
curl -s -X POST "$BASEURL/comments/$COMMENT_ID/replies" \
  -H "Content-Type: application/json" \
  -d "{\"profileId\":\"$PROFILE_ID\",\"userId\":\"$USER_ID\",\"text\":\"Shell reply\"}"
read -p "Press Enter to continue..."

# -----------------------------------------
# UPVOTE
# -----------------------------------------
echo "[6] Upvote..."
curl -s -X POST "$BASEURL/comments/$COMMENT_ID/vote" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"value\":1}"
read -p "Press Enter..."

# -----------------------------------------
# SECOND USER UPVOTE
# -----------------------------------------
if [ -n "$SECOND_USER_ID" ]; then
  echo "[7] Second user upvote..."
  curl -s -X POST "$BASEURL/comments/$COMMENT_ID/vote" \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$SECOND_USER_ID\",\"value\":1}"
  read -p "Press Enter..."
fi

# -----------------------------------------
# TOGGLE VOTE
# -----------------------------------------
echo "[8] Toggle vote..."
curl -s -X POST "$BASEURL/comments/$COMMENT_ID/vote" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"value\":1}"
read -p "Press Enter..."

# -----------------------------------------
# LIKE / UNLIKE
# -----------------------------------------
echo "[9] Like..."
curl -s -X POST "$BASEURL/comments/$COMMENT_ID/like" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\"}"
read -p "Press Enter..."

echo "[10] Unlike..."
curl -s -X POST "$BASEURL/comments/$COMMENT_ID/unlike" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\"}"
read -p "Press Enter..."

# -----------------------------------------
# SORT + FILTER
# -----------------------------------------
echo "[11] Sort=new"
curl -s "$BASEURL/comments?sort=new"
read -p "Press Enter..."

echo "[12] Sort=top"
curl -s "$BASEURL/comments?sort=top"
read -p "Press Enter..."

echo "[13] Filter by profile AND minVotes=1"
curl -s "$BASEURL/comments?profileId=$PROFILE_ID&minVotes=1&sort=top"
read -p "Press Enter..."

# -----------------------------------------
# UPDATE + DELETE
# -----------------------------------------
echo "[14] Update comment..."
curl -s -X PUT "$BASEURL/comments/$COMMENT_ID" \
  -H "Content-Type: application/json" \
  -d '{"text":"Updated from shell script"}'
read -p "Press Enter..."

echo "[15] Delete comment..."
curl -s -X DELETE "$BASEURL/comments/$COMMENT_ID"
read -p "Press Enter..."

echo "DONE."
