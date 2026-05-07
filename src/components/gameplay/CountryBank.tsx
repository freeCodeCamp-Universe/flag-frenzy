import { motion } from 'framer-motion';

import type { CountryOption } from '../../game/types';

interface CountryBankProps {
  countries: CountryOption[];
  onSelect: (countryId: string) => void;
  selectedCountryId?: string;
}

export function CountryBank({
  countries,
  onSelect,
  selectedCountryId,
}: CountryBankProps) {
  return (
    <aside
      aria-label="Country options"
      className="rounded border border-fcc-border p-3"
    >
      <h3 className="font-mono text-xl font-bold">Countries</h3>
      <p className="mt-1 font-mono text-base text-fcc-muted">Click or drag</p>
      <div className="mt-3 grid gap-2">
        {countries.map((country) => {
          const isSelected = country.id === selectedCountryId;

          return (
            <motion.button
              className={[
                'rounded border px-3 py-3 text-left font-mono outline-none transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-fcc-surface',
                isSelected
                  ? 'border-fcc-cta bg-fcc-cta text-fcc-background'
                  : 'border-fcc-border bg-fcc-background text-fcc-foreground',
              ].join(' ')}
              draggable
              key={country.id}
              onClick={() => {
                onSelect(country.id);
              }}
              onDragStartCapture={(event) => {
                event.dataTransfer.setData('text/plain', country.id);
              }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              type="button"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
            >
              {country.name}
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}
