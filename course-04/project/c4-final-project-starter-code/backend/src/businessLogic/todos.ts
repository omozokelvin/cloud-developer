import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { AttachmentUtils } from '../dataLayer/attachmentUtils'
import { TodosAccess } from '../dataLayer/todosAccess'

// TODO: Implement businessLogic

const logger = createLogger('todos')

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return todosAccess.getAllTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()
  const newTodo: TodoItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    ...createTodoRequest
  }

  logger.info('Creating todo', newTodo)

  return todosAccess.createTodo(newTodo)
}

export async function updateTodo(
  todoId: string,
  userId: string,
  todoUpdate: UpdateTodoRequest
): Promise<void> {
  return todosAccess.updateTodo(todoId, userId, todoUpdate)
}

export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<void> {
  logger.info('Deleting todo with id  => ', todoId)

  return todosAccess.deleteTodo(todoId, userId)
}

export async function createAttachmentPresignedUrl(
  todoId: string,
  userId: string
) {
  const signedUrl = await attachmentUtils.generateUploadUrl(todoId)

  const attachmentUrl = signedUrl.split('?')[0]

  logger.info('Url to view the document => ', attachmentUrl)

  await todosAccess.updateAttachmentUrl(todoId, userId, attachmentUrl)

  logger.info('Created signed attachment url', signedUrl)

  return signedUrl
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return todosAccess.getAllTodos(userId)
}
