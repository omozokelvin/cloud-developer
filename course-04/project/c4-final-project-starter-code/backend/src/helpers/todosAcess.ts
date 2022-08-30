import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const createDynamoDBClient = () => {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')

    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new AWS.DynamoDB.DocumentClient()
}

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(createTodoRequest: TodoItem): Promise<TodoItem> {
    logger.info('Creating a todo')

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: createTodoRequest
      })
      .promise()

    return createTodoRequest
  }

  async updateTodo(
    todoId: string,
    userId: string,
    todoUpdate: TodoUpdate
  ): Promise<void> {
    logger.info('Updating a todo')

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: 'set #name = :n, dueDate = :d, done = :done',
        ExpressionAttributeValues: {
          ':n': todoUpdate.name,
          ':d': todoUpdate.dueDate,
          ':done': todoUpdate.done
        },
        ExpressionAttributeNames: {
          '#name': 'name'
        }
      })
      .promise()
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    logger.info('Deleting a todo')

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()
  }

  async updateAttachmentUrl(
    todoId: string,
    userId: string,
    attachmentUrl: string
  ): Promise<void> {
    logger.info('Updating attachment url')

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: 'set attachmentUrl = :a',
        ExpressionAttributeValues: {
          ':a': attachmentUrl
        }
      })
      .promise()
  }

  async getTodoById(todoId: string, userId: string): Promise<TodoItem> {
    logger.info('Getting todo by id')

    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()

    return result.Item as TodoItem
  }
}
