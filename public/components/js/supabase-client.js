/**
 * Supabase Client
 * Database connection and data fetching for BOPS
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  var SUPABASE_URL = 'https://hbxorkqojkmfbrwiccoj.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhieG9ya3FvamttZmJyd2ljY29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjAwMzYsImV4cCI6MjA4MDYzNjAzNn0.69sLhEXaNAQ03Ujo310DTw_EfWSgkr8JeQuSPQeKnK8';

  // Initialize Supabase client
  var supabaseClient = null;

  function getClient() {
    if (!supabaseClient && window.supabase) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  /**
   * Load full application data for Review page
   * @param {string} reference - Application reference (e.g., '23-00527-PRE')
   * @returns {Promise<Object|null>}
   */
  async function loadApplication(reference) {
    var client = getClient();
    if (!client) {
      console.error('Supabase client not initialized');
      return null;
    }

    var { data, error } = await client
      .from('applications')
      .select(`
        *,
        submitted_site_boundaries (*),
        site_constraints (*),
        site_history (*),
        application_events (*),
        reports (
          *,
          case_officers (*),
          report_sections (*),
          planning_considerations (*),
          requirements (*),
          relevant_policies (*),
          report_site_boundaries (*)
        )
      `)
      .eq('reference', reference)
      .single();

    if (error) {
      console.error('Error loading application:', error);
      return null;
    }

    return data;
  }

  /**
   * Load just the report sections (for progress tracking)
   * @param {string} reportId - Report UUID
   * @returns {Promise<Array>}
   */
  async function loadReportSections(reportId) {
    var client = getClient();
    if (!client) return [];

    var { data, error } = await client
      .from('report_sections')
      .select('*')
      .eq('report_id', reportId)
      .order('display_order');

    if (error) {
      console.error('Error loading sections:', error);
      return [];
    }

    return data;
  }

  // ============================================
  // DATA SAVING
  // ============================================

  /**
   * Update section review status
   * @param {string} reportId - Report UUID
   * @param {string} sectionKey - Section identifier
   * @param {string} status - 'not_reviewed', 'agreed', 'returned'
   * @param {string} comments - Optional review comments
   * @returns {Promise<boolean>}
   */
  async function updateSectionReview(reportId, sectionKey, status, comments) {
    var client = getClient();
    if (!client) return false;

    var updateData = {
      review_status: status,
      reviewed_at: new Date().toISOString()
    };

    if (comments !== undefined) {
      updateData.review_comments = comments;
    }

    var { error } = await client
      .from('report_sections')
      .update(updateData)
      .eq('report_id', reportId)
      .eq('section_key', sectionKey);

    if (error) {
      console.error('Error updating section:', error);
      return false;
    }

    return true;
  }

  /**
   * Reset section to not reviewed
   * @param {string} reportId - Report UUID
   * @param {string} sectionKey - Section identifier
   * @returns {Promise<boolean>}
   */
  async function resetSectionReview(reportId, sectionKey) {
    var client = getClient();
    if (!client) return false;

    var { error } = await client
      .from('report_sections')
      .update({
        review_status: 'not_reviewed',
        review_comments: null,
        reviewed_at: null
      })
      .eq('report_id', reportId)
      .eq('section_key', sectionKey);

    if (error) {
      console.error('Error resetting section:', error);
      return false;
    }

    return true;
  }

  /**
   * Get review progress count
   * @param {string} reportId - Report UUID
   * @returns {Promise<number>}
   */
  async function getReviewProgress(reportId) {
    var client = getClient();
    if (!client) return 0;

    var { count, error } = await client
      .from('report_sections')
      .select('*', { count: 'exact', head: true })
      .eq('report_id', reportId)
      .neq('review_status', 'not_reviewed');

    if (error) {
      console.error('Error getting progress:', error);
      return 0;
    }

    return count || 0;
  }

  // ============================================
  // REPORT CONTENT FUNCTIONS
  // ============================================

  /**
   * Load site description from report
   * @param {string} reportId - Report UUID
   * @returns {Promise<string|null>}
   */
  async function loadSiteDescription(reportId) {
    var client = getClient();
    if (!client) return null;

    var { data, error } = await client
      .from('reports')
      .select('site_description')
      .eq('id', reportId)
      .single();

    if (error) {
      console.error('Error loading site description:', error);
      return null;
    }

    return data ? data.site_description : null;
  }

  /**
   * Update site description in report
   * @param {string} reportId - Report UUID
   * @param {string} content - New site description content
   * @returns {Promise<boolean>}
   */
  async function updateSiteDescription(reportId, content) {
    var client = getClient();
    if (!client) {
      console.error('Supabase client not initialized');
      return false;
    }

    console.log('Updating site description for report:', reportId);
    console.log('Content length:', content ? content.length : 0);

    var { data, error } = await client
      .from('reports')
      .update({ site_description: content })
      .eq('id', reportId)
      .select();

    if (error) {
      console.error('Error updating site description:', error);
      return false;
    }

    console.log('Update response:', data);
    if (!data || data.length === 0) {
      console.warn('No rows updated - check if reportId exists and RLS policies allow updates');
      return false;
    }

    console.log('Site description updated successfully');
    return true;
  }

  // ============================================
  // GUEST SESSION FUNCTIONS
  // ============================================

  /**
   * Clean up old guest reviews (older than 24 hours)
   * Called automatically when loading guest reviews
   */
  async function cleanupOldGuestReviews() {
    var client = getClient();
    if (!client) return;

    var oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    var { error, count } = await client
      .from('review_sessions')
      .delete()
      .lt('created_at', oneDayAgo);

    if (error) {
      console.error('Error cleaning up old guest reviews:', error);
    } else if (count > 0) {
      console.log('Cleaned up', count, 'old guest reviews');
    }
  }

  /**
   * Load guest review sessions for a specific user
   * @param {string} reportId - Report UUID
   * @param {string} reviewerName - Guest reviewer name
   * @returns {Promise<Array>}
   */
  async function loadGuestReviews(reportId, reviewerName) {
    var client = getClient();
    if (!client) return [];

    // Clean up old reviews first (fire and forget)
    cleanupOldGuestReviews();

    var { data, error } = await client
      .from('review_sessions')
      .select('*')
      .eq('report_id', reportId)
      .eq('reviewer_name', reviewerName);

    if (error) {
      console.error('Error loading guest reviews:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Update or create guest review session
   * @param {string} reportId - Report UUID
   * @param {string} reviewerName - Guest reviewer name
   * @param {string} sectionKey - Section identifier
   * @param {string} status - 'not_reviewed', 'agreed', 'returned'
   * @param {string} comments - Optional review comments
   * @returns {Promise<boolean>}
   */
  async function updateGuestReview(reportId, reviewerName, sectionKey, status, comments) {
    var client = getClient();
    if (!client) return false;

    var upsertData = {
      report_id: reportId,
      reviewer_name: reviewerName,
      section_key: sectionKey,
      review_status: status,
      reviewed_at: new Date().toISOString()
    };

    if (comments !== undefined) {
      upsertData.review_comments = comments;
    }

    var { error } = await client
      .from('review_sessions')
      .upsert(upsertData, {
        onConflict: 'report_id,reviewer_name,section_key'
      });

    if (error) {
      console.error('Error updating guest review:', error);
      return false;
    }

    return true;
  }

  /**
   * Reset guest review session
   * @param {string} reportId - Report UUID
   * @param {string} reviewerName - Guest reviewer name
   * @param {string} sectionKey - Section identifier
   * @returns {Promise<boolean>}
   */
  async function resetGuestReview(reportId, reviewerName, sectionKey) {
    var client = getClient();
    if (!client) return false;

    var { error } = await client
      .from('review_sessions')
      .delete()
      .eq('report_id', reportId)
      .eq('reviewer_name', reviewerName)
      .eq('section_key', sectionKey);

    if (error) {
      console.error('Error resetting guest review:', error);
      return false;
    }

    return true;
  }

  // ============================================
  // EXPORT
  // ============================================

  window.SupabaseClient = {
    getClient: getClient,
    loadApplication: loadApplication,
    loadReportSections: loadReportSections,
    updateSectionReview: updateSectionReview,
    resetSectionReview: resetSectionReview,
    getReviewProgress: getReviewProgress,
    // Report content functions
    loadSiteDescription: loadSiteDescription,
    updateSiteDescription: updateSiteDescription,
    // Guest functions
    loadGuestReviews: loadGuestReviews,
    updateGuestReview: updateGuestReview,
    resetGuestReview: resetGuestReview
  };

})();
