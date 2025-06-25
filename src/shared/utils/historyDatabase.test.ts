import {
  addConversation,
  getConversations,
  initHistoryDB,
} from "./historyDatabase";

jest.mock("expo-sqlite");

describe("historyDatabase", () => {
  beforeAll(async () => {
    await initHistoryDB();
  });

  it("should add and retrieve a conversation", async () => {
    const name = "Test Conversation";
    const phrases = ["Hello", "World"];
    await addConversation(name, phrases);
    const conversations = await getConversations();
    const found = conversations.find(
      (c) =>
        c.name === name && JSON.stringify(c.phrases) === JSON.stringify(phrases)
    );
    expect(found).toBeDefined();
    expect(found?.name).toBe(name);
    expect(found?.phrases).toEqual(phrases);
  });
});
