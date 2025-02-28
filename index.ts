import Fastify from "fastify"
// 使用类型导入语法
import type { FastifyRequest, FastifyInstance } from "fastify"

import fastifyRedis from "@fastify/redis"
import { createUser, deleteUser, getAllUsers, updateUser } from "./redis"
// 数据类型定义
interface User {
  name: string
  age: number
}

// Redis 键名
const USERS_KEY = "users"

// 定义请求参数接口
interface ItemParams {
  name: string
}
// 创建 Fastify 实例
const app: FastifyInstance = Fastify({ logger: true })

app.register(fastifyRedis, {
  host: "127.0.0.1",
  port: 6379,
})

// 读取所有（Read All）
app.get("/users", async () => {
  const users = await getAllUsers(app.redis)

  return users
})

// 创建（Create）
app.post(
  "/add/user",
  async (request: FastifyRequest<{ Params: ItemParams }>, reply) => {
    const body = request.body as { name: string }
    if (!body.name) {
      return reply.status(400).send({ error: "Name is required" })
    }
    const newUser = await createUser(app.redis, body)

    return reply.status(201).send(newUser)
  }
)

// 读取单个（Read One）
// app.get(
//   "/user/:name",
//   async (request: FastifyRequest<{ Params: ItemParams }>, reply) => {
//     const itemId = parseInt(request.params["name"])
//     const item = items.find((i) => i.id === itemId)
//     if (!item) {
//       return reply.status(404).send({ error: "Item not found" })
//     }
//     return item
//   }
// )

// 更新（Update）
app.put(
  "/user/:id",
  async (request: FastifyRequest<{ Params: ItemParams }>, reply) => {
    const name = request.params["name"]
    const body = request.body as { name: string }
    const users = await updateUser(app.redis, name, body)

    return reply.status(201).send(users)
  }
)

// // 删除（Delete）
app.delete(
  "/user/:name",
  async (request: FastifyRequest<{ Params: ItemParams }>, reply) => {
    const name = request.params["name"]
    const resp = await deleteUser(app.redis, name)

    return reply.status(201).send(resp)
  }
)

app.get("/", async (request, reply) => {
  return { message: "Hello, Bun + Fastify1!" }
})

// 启动服务器
const start = async () => {
  try {
    await app.listen({ port: 3000 })
    console.log("Server is running on http://localhost:3000")
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
