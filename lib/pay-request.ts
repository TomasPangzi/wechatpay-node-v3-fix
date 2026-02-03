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
        .responseType('blob') 
        .buffer(true);
        // 获取响应体
        let data: Buffer;
        
        if (response.body instanceof Buffer) {
          data = response.body;
        } else if (response.body) {
          // 如果是其他类型，尝试转换
          data = Buffer.from(JSON.stringify(response.body));
        } else if (response.xhr && response.xhr.response) {
          // 如果是 XMLHttpRequest 响应
          data = Buffer.from(response.xhr.response);
        } else if (response.text) {
          // 如果是文本响应
          data = Buffer.from(response.text);
        } else {
          throw new Error('无法获取响应体');
        }

        return {
            success: true,
            data: data,
            status: response.status
        };
    } catch (error) {
      return {
        success: false,
        error: error.message || '下载失败',
        status: 500
      };
    }
  }
}
