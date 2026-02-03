import { Output } from './interface-v2';
import { IPayRequest } from './pay-request.interface';
import request from 'superagent';

export class PayRequest implements IPayRequest {
  async upload(url: string, params: Record<string, any>|undefined, headers: Record<string, any>): Promise<Output> {
    try {
      const result = await request
        .post(url)
        .send(params)
        .attach('file', params?.pic_buffer, {
          filename: '72fe0092be0cf9dd8420579cc954fb4e.jpg',
          contentType: 'image/jpg',
        })
        .field('meta', JSON.stringify(params?.fileinfo));
      return {
        status: result.status,
        data: result.body,
      };
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      return {
        status: err.status as number,
        errRaw: err,
        error: err?.response?.text,
      };
    }
  }
  async post(url: string, params: Record<string, any>, headers: Record<string, any>): Promise<Output> {
    try {
      const result = await request
        .post(url)
        .send(params)
        .set(headers);
      return {
        status: result.status,
        data: result.body,
      };
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      return {
        status: err.status as number,
        errRaw: err,
        error: err?.response?.text,
      };
    }
  }

  async get(url: string, headers: Record<string, any>): Promise<Output> {
    try {
      const result = await request.get(url).set(headers);

      let data: any = {};
      if (result.type === 'text/plain') {
        data = {
          status: result.status,
          data: result.text,
        };
      } else {
        data = {
          status: result.status,
          data: result.body,
        };
      }

      return data;
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      return {
        status: err.status,
        errRaw: err,
        error: err?.response?.text,
      };
    }
  }

  async downloadFile(url: string, headers: Record<string, any>): Promise<{
    success: boolean;
    data?: Buffer;
    error?: string;
    status?: number;
  }> {
    try {
      const response = await request
        .get(url)
        .set(headers)
        .buffer(true);
          // +++ 添加关键调试日志 +++
        console.log('[原始响应] 状态码:', response.status);
        console.log('[原始响应] 响应头:', JSON.stringify(response.headers));
        const contentType = response.header['content-type'];
        console.log('[原始响应] Content-Type:', contentType);
        console.log('[原始响应] response.body 类型:', typeof response.body);
        console.log('[原始响应] response.body 长度:', response.body?.length);
        // 如果不是Buffer，打印开头内容看看是什么
        if (!Buffer.isBuffer(response.body) && response.body) {
          const bodyStart = String(response.body).substring(0, 500);
          console.log('[原始响应] response.body 开头:', bodyStart);
        }
        
      return {
        success: true,
        data: response.body,
        status: response.status
      };
    } catch (error) {
      console.error('文件下载失败:', error);
      return {
        success: false,
        error: '下载失败',
        status: 500
      };
    }
  }
}
