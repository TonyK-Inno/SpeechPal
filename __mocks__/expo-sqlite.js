let conversations = [];
let idCounter = 1;

module.exports = {
  openDatabaseAsync: jest.fn(() => ({
    execAsync: jest.fn(),
    runAsync: jest.fn((sql, params) => {
      if (sql.startsWith("INSERT INTO conversations")) {
        conversations.push({
          id: idCounter++,
          name: params[0],
          date: params[1],
          phrases: params[2],
        });
      }
      if (sql.startsWith("DELETE FROM conversations")) {
        const id = params[0];
        conversations = conversations.filter((c) => c.id !== id);
      }
      return Promise.resolve();
    }),
    getAllAsync: jest.fn((sql, params) => {
      if (sql.startsWith("SELECT * FROM conversations")) {
        // Return all conversations as if from DB
        return Promise.resolve(
          conversations.map((c) => ({
            id: c.id,
            name: c.name,
            date: c.date,
            phrases: c.phrases,
          }))
        );
      }
      return Promise.resolve([]);
    }),
    getFirstAsync: jest.fn(() => Promise.resolve(null)),
  })),
};
