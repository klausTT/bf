// plugins/redis.ts
import type { FastifyInstance } from "fastify"
import redisPlugin from "@fastify/redis"
import Redis from "ioredis" // 用于类型声明

export default async function setupRedis(fastify: FastifyInstance) {
  await fastify.register(redisPlugin, {
    client: {
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      password: process.env.REDIS_PASSWORD,
      database: 0,
      // 防止长时间无请求断开（参考 <button class="citation-flag" data-index="9">）
      connectionName: "keepAlive",
      options: {
        keepAlive: 86400, // 保持连接活跃
        timeout: 2000, // 命令超时时间
      },
    },
    // 关键：关联 ioredis 类型定义
    schema: {
      Client: Redis,
    },
  })

  // 挂载 Redis 客户端到实例
  fastify.decorate("redis", fastify.redis.client)
}
