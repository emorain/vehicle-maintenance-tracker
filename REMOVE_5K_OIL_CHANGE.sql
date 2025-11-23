-- =====================================================
-- Remove 5k Oil Change Default Protocol
-- =====================================================
-- This removes the "Oil Change - 5k/5mo" default protocol
-- Users can now clone the 3k protocol and customize it instead

-- Delete the 5k oil change default protocol
DELETE FROM maintenance_protocols
WHERE name = 'Oil Change - 5k/5mo'
AND is_default = true;

-- Also remove any vehicle_protocols assignments for this protocol
-- (This will clean up any vehicles that had this protocol assigned)
DELETE FROM vehicle_protocols
WHERE protocol_id IN (
  SELECT id FROM maintenance_protocols
  WHERE name = 'Oil Change - 5k/5mo'
  AND is_default = true
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '5k Oil Change default protocol removed successfully!';
  RAISE NOTICE 'Users can now clone the 3k protocol and customize intervals.';
END $$;
