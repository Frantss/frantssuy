import { DurableObject } from "cloudflare:workers";

export class ArticleLikes extends DurableObject {
  constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
    super(ctx, env);
    this.ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS likes (id INTEGER PRIMARY KEY CHECK (id = 1), count INTEGER NOT NULL CHECK (count >= 0))",
    );
  }

  getCount() {
    return this.ctx.storage.sql
      .exec<{ count: number }>("SELECT COALESCE(MAX(count), 0) AS count FROM likes")
      .one();
  }

  addLike() {
    return this.ctx.storage.sql
      .exec<{ count: number }>(
        "INSERT INTO likes (id, count) VALUES (1, 1) ON CONFLICT(id) DO UPDATE SET count = likes.count + 1 RETURNING count",
      )
      .one();
  }
}
