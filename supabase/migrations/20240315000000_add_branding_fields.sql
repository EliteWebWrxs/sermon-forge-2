-- Add branding customization fields to users_metadata table
ALTER TABLE users_metadata
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#1E3A8A',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS font_preference TEXT DEFAULT 'inter' CHECK (font_preference IN ('inter', 'roboto', 'open-sans', 'lato', 'montserrat', 'poppins'));

-- Add comment explaining the branding fields
COMMENT ON COLUMN users_metadata.primary_color IS 'Primary brand color in hex format (e.g., #1E3A8A)';
COMMENT ON COLUMN users_metadata.secondary_color IS 'Secondary brand color in hex format (e.g., #3B82F6)';
COMMENT ON COLUMN users_metadata.font_preference IS 'Preferred font family for exports';
