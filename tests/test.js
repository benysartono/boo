// ===============================================================
// Automated Test Suite for BOO API
// Minimal runner: no Jest, no Mocha — works everywhere
// ===============================================================

const BASE = process.env.BASEURL || "https://8a474806-c0fe-45f5-ab95-b14e8bbc296d-00-14b3k6ql2q1ci.sisko.replit.dev/boo";

const j = r => JSON.stringify(r, null, 2);

async function req(method, path, body = null) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  return await res.json();
}

function assert(cond, msg) {
  if (!cond) {
    console.error("❌ TEST FAILED:", msg);
    process.exit(1);
  }
  console.log("✔", msg);
}

(async () => {
  console.log("====================================");
  console.log(" BOO API AUTOMATED TESTS");
  console.log("====================================");

  // -----------------------------------
  // Create Profile
  // -----------------------------------
  const profile = await req("POST", "/profiles", {
    name: "TestProfile",
    title: "QA",
    description: "Automated Test Profile"
  });

  assert(profile.id, "Profile created");
  const PROFILE_ID = profile.id;

  // -----------------------------------
  // Create Users
  // -----------------------------------
  const user1 = await req("POST", "/users", { name: "User1" });
  const user2 = await req("POST", "/users", { name: "User2" });

  assert(user1.id, "User1 created");
  assert(user2.id, "User2 created");

  const USER_ID = user1.id;
  const USER2_ID = user2.id;

  // -----------------------------------
  // Create Comment
  // -----------------------------------
  const comment = await req("POST", "/comments", {
    profileId: PROFILE_ID,
    userId: USER_ID,
    text: "Automated test comment"
  });

  assert(comment.id, "Comment created");
  const COMMENT_ID = comment.id;

  // -----------------------------------
  // Create Reply
  // -----------------------------------
  const reply = await req("POST", `/comments/${COMMENT_ID}/replies`, {
    userId: USER_ID,
    profileId: PROFILE_ID,
    text: "Automated reply"
  });

  assert(reply.id, "Reply created");

  // -----------------------------------
  // Upvote
  // -----------------------------------
  const upvote = await req("POST", `/comments/${COMMENT_ID}/vote`, {
    userId: USER_ID,
    value: 1
  });

  assert(upvote.score === 1, "Upvote applied");

  // -----------------------------------
  // Second user upvote
  // -----------------------------------
  const upvote2 = await req("POST", `/comments/${COMMENT_ID}/vote`, {
    userId: USER2_ID,
    value: 1
  });

  assert(upvote2.score === 2, "Second user upvote applied");

  // -----------------------------------
  // Toggle vote from user1 (should remove)
  // -----------------------------------
  const toggle = await req("POST", `/comments/${COMMENT_ID}/vote`, {
    userId: USER_ID,
    value: 1
  });

  assert(toggle.score === 1, "Vote toggled off by user1");

  // -----------------------------------
  // Like + Unlike
  // -----------------------------------
  const like = await req("POST", `/comments/${COMMENT_ID}/like`, {
    userId: USER_ID
  });

  assert(like.likesCount === 1, "Comment liked");

  const unlike = await req("POST", `/comments/${COMMENT_ID}/unlike`, {
    userId: USER_ID
  });

  assert(unlike.likesCount === 0, "Comment unliked");

  // -----------------------------------
  // Sorting Tests
  // -----------------------------------
  const sortNew = await req("GET", `/comments?sort=new`);
  assert(sortNew.length > 0, "Sort by new returned results");

  const sortTop = await req("GET", `/comments?sort=top`);
  assert(sortTop.length > 0, "Sort by top returned results");

  // -----------------------------------
  // Filtering Tests
  // -----------------------------------
  const filtered = await req(
    "GET",
    `/comments?profileId=${PROFILE_ID}&minVotes=1&sort=top`
  );

  assert(Array.isArray(filtered), "Filtering returned JSON array");

  // -----------------------------------
  // Update Comment
  // -----------------------------------
  const updated = await req("PUT", `/comments/${COMMENT_ID}`, {
    text: "Updated by automated test"
  });

  // API returns { success, updated:{commentData} }
  assert(updated.updated.text === "Updated by automated test", "Comment updated");

  // -----------------------------------
  // Delete Comment
  // -----------------------------------
  const deleted = await req("DELETE", `/comments/${COMMENT_ID}`);
  assert(deleted.success === true, "Comment deleted");

  console.log("\n====================================");
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
  console.log("====================================\n");

  process.exit(0);
})();
