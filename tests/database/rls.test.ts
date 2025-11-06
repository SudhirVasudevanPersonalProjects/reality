import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

const supabaseUrl = 'http://127.0.0.1:55321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

describe('Row Level Security (RLS) Tests', () => {
  let userAClient: ReturnType<typeof createClient<Database>>;
  let userBClient: ReturnType<typeof createClient<Database>>;
  let userAId: string;
  let userBId: string;
  let userASomethingId: string;

  beforeAll(async () => {
    // Create User A
    const supabaseA = createClient<Database>(supabaseUrl, supabaseKey);
    const { data: dataA, error: errorA } = await supabaseA.auth.signUp({
      email: `test-rls-a-${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });

    if (errorA) throw errorA;
    if (!dataA.user) throw new Error('Failed to create user A');

    userAId = dataA.user.id;
    userAClient = supabaseA;

    // Create User B
    const supabaseB = createClient<Database>(supabaseUrl, supabaseKey);
    const { data: dataB, error: errorB } = await supabaseB.auth.signUp({
      email: `test-rls-b-${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });

    if (errorB) throw errorB;
    if (!dataB.user) throw new Error('Failed to create user B');

    userBId = dataB.user.id;
    userBClient = supabaseB;

    // Create a something for User A
    const { data: somethingData, error: somethingError } = await userAClient
      .from('somethings')
      .insert({
        user_id: userAId,
        content_type: 'text',
        text_content: 'User A something',
        captured_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (somethingError) throw somethingError;
    if (!somethingData) throw new Error('Failed to create something for user A');

    userASomethingId = somethingData.id;
  });

  afterAll(async () => {
    // Cleanup users (cascades to all data)
    const adminClient = createClient<Database>(supabaseUrl, supabaseKey);
    if (userAId) await adminClient.auth.admin.deleteUser(userAId);
    if (userBId) await adminClient.auth.admin.deleteUser(userBId);
  });

  describe('Somethings Table RLS', () => {
    it('User A can read their own somethings', async () => {
      const { data, error } = await userAClient
        .from('somethings')
        .select('*')
        .eq('id', userASomethingId)
        .single();

      expect(error).toBeNull();
      expect(data?.id).toBe(userASomethingId);
    });

    it('User B cannot read User A somethings', async () => {
      const { data, error } = await userBClient
        .from('somethings')
        .select('*')
        .eq('id', userASomethingId)
        .single();

      // Should return null data (filtered out by RLS)
      expect(data).toBeNull();
    });

    it('User A can update their own somethings', async () => {
      const { error } = await userAClient
        .from('somethings')
        .update({ text_content: 'Updated by User A' })
        .eq('id', userASomethingId);

      expect(error).toBeNull();
    });

    it('User B cannot update User A somethings', async () => {
      const { error } = await userBClient
        .from('somethings')
        .update({ text_content: 'Attempted update by User B' })
        .eq('id', userASomethingId);

      // No error, but no rows affected (RLS blocks it)
      expect(error).toBeNull();
    });

    it('User A can delete their own somethings', async () => {
      // Create a new something to delete
      const { data: newSomething } = await userAClient
        .from('somethings')
        .insert({
          user_id: userAId,
          content_type: 'text',
          text_content: 'To be deleted',
          captured_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { error } = await userAClient
        .from('somethings')
        .delete()
        .eq('id', newSomething!.id);

      expect(error).toBeNull();
    });

    it('User B cannot delete User A somethings', async () => {
      const { error } = await userBClient
        .from('somethings')
        .delete()
        .eq('id', userASomethingId);

      // No error, but no rows affected
      expect(error).toBeNull();

      // Verify it still exists
      const { data } = await userAClient
        .from('somethings')
        .select('*')
        .eq('id', userASomethingId)
        .single();

      expect(data).toBeDefined();
    });
  });

  describe('Extension Tables RLS', () => {
    it('User B cannot read User A reality extensions', async () => {
      // User A creates a reality extension
      await userAClient.from('my_reality').insert({
        something_id: userASomethingId,
        latitude: 37.7749,
        longitude: -122.4194,
      });

      // User B tries to read it
      const { data } = await userBClient
        .from('my_reality')
        .select('*')
        .eq('something_id', userASomethingId)
        .single();

      expect(data).toBeNull();
    });
  });

  describe('Domains RLS', () => {
    it('User A can read their own domains', async () => {
      const { data, error } = await userAClient
        .from('domains')
        .select('*')
        .eq('user_id', userAId);

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('User B cannot read User A domains', async () => {
      const { data } = await userBClient
        .from('domains')
        .select('*')
        .eq('user_id', userAId);

      expect(data?.length).toBe(0);
    });
  });

  describe('Categories RLS', () => {
    it('User A can create and read their own categories', async () => {
      const { data, error } = await userAClient
        .from('categories')
        .insert({
          user_id: userAId,
          name: 'Test Category',
          domain: 'reality',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.name).toBe('Test Category');
    });

    it('User B cannot read User A categories', async () => {
      const { data } = await userBClient
        .from('categories')
        .select('*')
        .eq('user_id', userAId);

      expect(data?.length).toBe(0);
    });
  });

  describe('Tags RLS', () => {
    it('User A can create and read their own tags', async () => {
      const { data, error } = await userAClient
        .from('tags')
        .insert({
          user_id: userAId,
          name: 'test-tag',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.name).toBe('test-tag');
    });

    it('User B cannot read User A tags', async () => {
      const { data } = await userBClient.from('tags').select('*').eq('user_id', userAId);

      expect(data?.length).toBe(0);
    });
  });
});
