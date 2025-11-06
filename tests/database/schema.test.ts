import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

// Use local Supabase instance for testing
const supabaseUrl = 'http://127.0.0.1:55321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

describe('Database Schema Tests', () => {
  let testUserId: string;
  let testSomethingId: string;

  beforeAll(async () => {
    // Create a test user
    const { data, error } = await supabase.auth.signUp({
      email: `test-schema-${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to create test user');

    testUserId = data.user.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test user (cascades to all related data)
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  describe('Somethings Table', () => {
    it('should create a something with all new columns', async () => {
      const { data, error } = await supabase
        .from('somethings')
        .insert({
          user_id: testUserId,
          content_type: 'text',
          text_content: 'Test something',
          realm: 'reality',
          domain: 'reality',
          category_path: 'test/category',
          care: 5,
          care_frequency: 1,
          attributes: { custom_field: 'custom_value' },
          captured_at: new Date().toISOString(),
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.realm).toBe('reality');
      expect(data?.domain).toBe('reality');
      expect(data?.category_path).toBe('test/category');
      expect(data?.care).toBe(5);
      expect(data?.care_frequency).toBe(1);
      expect(data?.attributes).toEqual({ custom_field: 'custom_value' });
      expect(data?.captured_at).toBeDefined();
      expect(data?.updated_at).toBeDefined();

      testSomethingId = data!.id;
    });

    it('should enforce care constraint (1-5)', async () => {
      const { error } = await supabase.from('somethings').insert({
        user_id: testUserId,
        content_type: 'text',
        text_content: 'Test invalid care',
        care: 6, // Invalid
        captured_at: new Date().toISOString(),
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('care');
    });

    it('should enforce realm constraint', async () => {
      const { error } = await supabase.from('somethings').insert({
        user_id: testUserId,
        content_type: 'text',
        text_content: 'Test invalid realm',
        realm: 'invalid' as any, // Invalid realm
        captured_at: new Date().toISOString(),
      });

      expect(error).toBeDefined();
    });
  });

  describe('Default Domains', () => {
    it('should seed 4 default domains for new users', async () => {
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('user_id', testUserId)
        .order('sort_order', { ascending: true });

      expect(error).toBeNull();
      expect(data).toHaveLength(4);

      // Check each default domain
      expect(data?.[0].domain_name).toBe('abode');
      expect(data?.[0].sort_order).toBe(0);
      expect(data?.[0].is_default).toBe(true);

      expect(data?.[1].domain_name).toBe('reality');
      expect(data?.[1].sort_order).toBe(1);
      expect(data?.[1].includes_realms).toContain('reality');

      expect(data?.[2].domain_name).toBe('mind');
      expect(data?.[2].sort_order).toBe(2);
      expect(data?.[2].includes_realms).toContain('mind');

      expect(data?.[3].domain_name).toBe('heart');
      expect(data?.[3].sort_order).toBe(3);
      expect(data?.[3].includes_realms).toContain('heart');
    });
  });

  describe('Extension Tables', () => {
    it('should create my_reality record', async () => {
      const { data, error } = await supabase.from('my_reality').insert({
        something_id: testSomethingId,
        latitude: 37.7749,
        longitude: -122.4194,
        location_name: 'San Francisco',
        quality_score: 9,
      }).select().single();

      expect(error).toBeNull();
      expect(data?.latitude).toBe(37.7749);
      expect(data?.longitude).toBe(-122.4194);
      expect(data?.quality_score).toBe(9);
    });

    it('should create cares record', async () => {
      const { data: somethingData } = await supabase
        .from('somethings')
        .insert({
          user_id: testUserId,
          content_type: 'text',
          text_content: 'Test care',
          realm: 'heart',
          captured_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data, error } = await supabase.from('cares').insert({
        something_id: somethingData!.id,
        intensity: 0.8,
        why: 'Because it matters',
        fulfilled: false,
      }).select().single();

      expect(error).toBeNull();
      expect(data?.intensity).toBe(0.8);
      expect(data?.why).toBe('Because it matters');
      expect(data?.fulfilled).toBe(false);
    });

    it('should create thoughts record with relationships', async () => {
      const { data: somethingData } = await supabase
        .from('somethings')
        .insert({
          user_id: testUserId,
          content_type: 'text',
          text_content: 'Test thought',
          realm: 'mind',
          captured_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data, error } = await supabase.from('thoughts').insert({
        something_id: somethingData!.id,
        thought_type: 'reflection',
      }).select().single();

      expect(error).toBeNull();
      expect(data?.thought_type).toBe('reflection');
    });
  });

  describe('Category System', () => {
    it('should create category with auto-computed full_path', async () => {
      const { data: rootCategory, error: rootError } = await supabase
        .from('categories')
        .insert({
          user_id: testUserId,
          name: 'Abilities',
          domain: 'reality',
        })
        .select()
        .single();

      expect(rootError).toBeNull();
      expect(rootCategory?.full_path).toBe('Abilities');
      expect(rootCategory?.depth).toBe(0);

      const { data: childCategory, error: childError } = await supabase
        .from('categories')
        .insert({
          user_id: testUserId,
          name: 'Strengths',
          parent_id: rootCategory!.id,
          domain: 'reality',
        })
        .select()
        .single();

      expect(childError).toBeNull();
      expect(childCategory?.full_path).toBe('Abilities/Strengths');
      expect(childCategory?.depth).toBe(1);
    });
  });

  describe('Tags System', () => {
    it('should create tag and attach to something', async () => {
      const { data: tag, error: tagError } = await supabase
        .from('tags')
        .insert({
          user_id: testUserId,
          name: 'important',
          color: '#FF0000',
        })
        .select()
        .single();

      expect(tagError).toBeNull();
      expect(tag?.name).toBe('important');

      const { error: linkError } = await supabase.from('something_tags').insert({
        something_id: testSomethingId,
        tag_id: tag!.id,
      });

      expect(linkError).toBeNull();
    });
  });

  describe('Connections Table', () => {
    it('should create connection between somethings', async () => {
      const { data: something2 } = await supabase
        .from('somethings')
        .insert({
          user_id: testUserId,
          content_type: 'text',
          text_content: 'Connected something',
          captured_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data, error } = await supabase.from('connections').insert({
        user_id: testUserId,
        from_something_id: testSomethingId,
        to_something_id: something2!.id,
        relationship_type: 'caused',
        strength: 8,
        meaning: 'This caused that',
      }).select().single();

      expect(error).toBeNull();
      expect(data?.relationship_type).toBe('caused');
      expect(data?.strength).toBe(8);
    });

    it('should prevent self-connections', async () => {
      const { error } = await supabase.from('connections').insert({
        user_id: testUserId,
        from_something_id: testSomethingId,
        to_something_id: testSomethingId, // Same ID
        relationship_type: 'self',
      });

      expect(error).toBeDefined();
    });
  });

  describe('Triggers', () => {
    it('should auto-update updated_at on somethings', async () => {
      const { data: original } = await supabase
        .from('somethings')
        .select('updated_at')
        .eq('id', testSomethingId)
        .single();

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await supabase
        .from('somethings')
        .update({ text_content: 'Updated content' })
        .eq('id', testSomethingId);

      const { data: updated } = await supabase
        .from('somethings')
        .select('updated_at')
        .eq('id', testSomethingId)
        .single();

      expect(new Date(updated!.updated_at!).getTime()).toBeGreaterThan(
        new Date(original!.updated_at!).getTime()
      );
    });
  });
});
