-- -------------------------------------------------------------------------
-- 1. Remove constraint blocking reorder operations
-- TripCommandService gurantee the unique ordering of visit_order
-- -------------------------------------------------------------------------
ALTER TABLE itinerary 
    DROP CONSTRAINT uq_itinerary_trip_day_id_visit_order;

-- -------------------------------------------------------------------------
-- 2. Fix ON DELETE SET NULL on NOT NULL user_id in bookmark_category
-- The original design mistakenly included user_id in the foreign key constraint for custom_category,
-- which caused unintended cascading deletes. This migration removes the flawed constraint and re-adds it correctly.
-- -------------------------------------------------------------------------
-- Remove the incorrect foreign key constraint that includes user_id
ALTER TABLE bookmark 
    DROP CONSTRAINT fk_bookmark_custom_category_user_scoped;

-- Re-add the foreign key constraint correctly, referencing only the custom_category field
ALTER TABLE bookmark
    ADD CONSTRAINT fk_bookmark_custom_category_user_scoped
    FOREIGN KEY (custom_category, user_id)
    REFERENCES bookmark_category (id, user_id)
    ON DELETE SET NULL (custom_category);