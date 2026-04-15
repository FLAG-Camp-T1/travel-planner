-- -------------------------------------------------------------------------
-- H2-compatible test migration that preserves the production semantics:
-- deleting a bookmark category nulls only bookmark.custom_category while
-- leaving bookmark.user_id intact and still enforcing user-scoped category ids.
-- -------------------------------------------------------------------------

ALTER TABLE itinerary
    DROP CONSTRAINT uq_itinerary_trip_day_id_visit_order;

ALTER TABLE bookmark
    DROP CONSTRAINT fk_bookmark_custom_category_user_scoped;

ALTER TABLE bookmark
    ADD CONSTRAINT fk_bookmark_custom_category_user_scoped
    FOREIGN KEY (custom_category, user_id)
    REFERENCES bookmark_category (id, user_id);

CREATE TRIGGER trg_bookmark_category_clear_custom_category
BEFORE DELETE
ON bookmark_category
FOR EACH ROW
CALL 'com.travelplanner.backend.testsupport.H2BookmarkCategoryDeleteTrigger';
