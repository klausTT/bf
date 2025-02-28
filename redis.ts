import type { FastifyRedis } from "@fastify/redis"

// 数据类型定义
interface User {
  name: string
  age?: number
}

// Redis 键名
const USERS_KEY = "users"

// 数据库操作封装
async function getAllUsers(redis: FastifyRedis): Promise<User[]> {
  const data = await redis.get(USERS_KEY)
  return data ? (JSON.parse(data) as User[]) : []
}

async function createUser(redis: FastifyRedis, user: User): Promise<User> {
  const users = await getAllUsers(redis)
  users.push(user)
  await redis.set(USERS_KEY, JSON.stringify(users))
  return user
}

async function updateUser(
  redis: FastifyRedis,
  name: string,
  updatedUser: User
): Promise<User | null> {
  const users = await getAllUsers(redis)
  const index = users.findIndex((u) => u.name === name)
  if (index === -1) return null
  users[index] = { ...users[index], ...updatedUser }
  await redis.set(USERS_KEY, JSON.stringify(users))
  return users[index]
}

async function deleteUser(redis: FastifyRedis, name: string): Promise<boolean> {
  const users = await getAllUsers(redis)
  const index = users.findIndex((u) => u.name === name)
  if (index === -1) return false
  users.splice(index, 1)
  await redis.set(USERS_KEY, JSON.stringify(users))
  return true
}

export { createUser, getAllUsers, updateUser, deleteUser }
