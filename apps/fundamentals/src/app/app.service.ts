import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return ({ message: 'Hello API' });
  }

  getDataWithId(id: string): { message: string } {
    return ({ message: `Hello API with ID: ${id}` });
  }

  postData(body: Record<string, unknown>): { body: Record<string, unknown>, message: string } {
    return { body, message: `Created body ${JSON.stringify(body)}` };
  }

  update(id: string, body: Record<string, unknown>): {id: string, body: Record<string, unknown>, message: string } {
    return {
      id, body, message: `Replaced ${id} with body ${JSON.stringify(body)}`
    }
  }

  extend(id: string, body: Record<string, unknown>): {id: string, body: Record<string, unknown>, message: string } {
    return {
      id, body, message: `Extended ${id} with body ${JSON.stringify(body)}`
    }
  }

  remove(id: string): {id: string, message: string } {
    return {
      id, message: `Removed ${id}`
    }
  }
}
