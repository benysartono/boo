// ===============================================================
// Automated Test Suite for BOO API
// Minimal runner: no Jest, no Mocha — works everywhere
// ===============================================================

// Default to LOCAL server
const BASE = process.env.BASEURL || "http://localhost:3000/boo";

// Helper
async function req(method, path, body = null) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });

  // Fail fast if server is asleep / HTML returned
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    console.error("❌ Non-JSON response received:");
    console.error(text.slice(0, 300));
    process.exit(1);
  }

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
  console.log(" Base URL:", BASE);
  console.log("====================================");

  // Create Profile
  const profile = await req("POST", "/profiles", {
    name: "TestProfile",
    title: "QA",
    description: "Automated Test Profile"
  });
  assert(profile.id, "Profile created");
  const PROFILE_ID = profile.id;

  // Create Users
  const user1 = await req("POST", "/users", { name: "User1" });
  const user2 = await req("POST", "/users", { name: "User2" });
  assert(user1.id, "User1 created");
  assert(user2.id, "User2 created");

  const USER_ID = user1.id;
  const USER2_ID = user2.id;

  // Create Comment
  const comment = await req("POST", "/comments", {
    profileId: PROFILE_ID,
    userId: USER_ID,
    text: "Automated test comment"
  });
  assert(comment.id, "Comment created");
  const COMMENT_ID = comment.id;

  // Reply
  const reply = await req("POST", `/comments/${COMMENT_ID}/replies`, {
    userId: USER_ID,
    profileId: PROFILE_ID,
    text: "Automated reply"
  });
  assert(reply.id, "Reply created");

  // Voting
  const upvote = await req("POST", `/comments/${COMMENT_ID}/vote`, {
    userId: USER_ID,
    value: 1
  });
  assert(upvote.score === 1, "Upvote applied");

  const upvote2 = await req("POST", `/comments/${COMMENT_ID}/vote`, {
    userId: USER2_ID,
    value: 1
  });
  assert(upvote2.score === 2, "Second user upvote applied");

  const toggle = await req("POST", `/comments/${COMMENT_ID}/vote`, {
    userId: USER_ID,
    value: 1
  });
  assert(toggle.score === 1, "Vote toggled off");

  // Like / Unlike
  const like = await req("POST", `/comments/${COMMENT_ID}/like`, { userId: USER_ID });
  assert(like.likesCount === 1, "Liked");

  const unlike = await req("POST", `/comments/${COMMENT_ID}/unlike`, { userId: USER_ID });
  assert(unlike.likesCount === 0, "Unliked");

  // Sorting & Filtering
  const sortNew = await req("GET", `/comments?sort=new`);
  assert(sortNew.length > 0, "Sort new works");

  const sortTop = await req("GET", `/comments?sort=top`);
  assert(sortTop.length > 0, "Sort top works");

  // Update
  const updated = await req("PUT", `/comments/${COMMENT_ID}`, {
    text: "Updated by automated test"
  });
  assert(updated.updated.text === "Updated by automated test", "Comment updated");

  // Delete
  const deleted = await req("DELETE", `/comments/${COMMENT_ID}`);
  assert(deleted.success === true, "Comment deleted");

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
})();
