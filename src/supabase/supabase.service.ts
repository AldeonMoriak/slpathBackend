import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private _supabaseClient: SupabaseClient;
  // Create a single supabase client for interacting with your database
  constructor() {
    if (!this._supabaseClient)
      this._supabaseClient = createClient(
        'https://kbodliatjlwcgvcbarwj.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjI2Nzk5MzI4LCJleHAiOjE5NDIzNzUzMjh9.jQ55i0ysMnB5b6BYP5jf8BBFvg1scpRq_QzHxMfNSdM',
      );
  }

  async uploadFile(file: any, name: string, mimetype: string): Promise<any> {
    const { data, error } = await this._supabaseClient.storage
      .from('tani-images')
      .upload(name, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimetype,
      });
    console.log(data);
    console.error(error);
  }
}
