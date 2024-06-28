import { CircularProgress, Popover } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropertyItem from './PropertyItem';
import { getPropertyList, getPropertyPrices } from '../apis/PropertyApi';
import { useReduxStateSelector } from '../hooks/useReduxStateSelector';

const location = {
  key: 'tokyo',
  name: 'Tokyo', 
};

interface SortByOption {
  key: string;
  name: string;
}

const sortByOptions = [
  { key: 'topPicks', name: 'Our top picks' },
  { key: 'priceLow', name: 'Price (lowest first)' },
  { key: 'priceHigh', name: 'Price (highest first)' },
  { key: 'ratingHigh', name: 'Property rating (high to low)' },
  { key: 'ratingLow', name: 'Property rating (low to high)' },
];

const PropertyList: React.FC = () => {
  const currency = useReduxStateSelector((state) => state.currency);

  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [sortBy, setSortBy] = useState<SortByOption>(sortByOptions[0]);

  const [isSortByPopoverOpen, setIsSortByPopoverOpen] = React.useState(false);
  const sortByAnchorRef = useRef<HTMLButtonElement>(null);

  const popoverSlotProps = useMemo(() => ({
    paper: { style: { marginTop: '12px', borderRadius: '8px' } },
  }), []);

  const fetchProperties = useCallback(async () => {
    if (!currency || !sortBy?.key) return;
    setIsLoading(true);
    try {
      // Fetch properties basic information
      const result = await getPropertyList();
      // Fetch property prices
      let propertyPrices : PropertyPrice[] = [];
      try {
        propertyPrices = await getPropertyPrices(currency);
      } catch (error) {
        // Handle error
      }

      // Merge property prices into properties
      const response = result.map((property) => {
        const propertyPrice = propertyPrices.find((price) => price.id === property.id);
        return { ...property, propertyPrice };
      });

      response.sort((a, b) => {
        // Sort properties based on selected sort option

        // Handle missing property price  
        if (!a.propertyPrice) return 1; // a is greater => send to the end
        if (!b.propertyPrice) return -1; // b is greater => send to the end

        switch (sortBy?.key) {
          case 'priceLow':
            return a.propertyPrice?.price - b.propertyPrice?.price;
          case 'priceHigh':
            return b.propertyPrice?.price - a.propertyPrice?.price;
          case 'ratingHigh':
            return b.rating - a.rating;
          case 'ratingLow':
            return a.rating - b.rating;
          default:
            return 0;
        }
      });

      setProperties(response);
    } catch (error) {
      // Handle error
    }
    setIsLoading(false);
  }, [currency, sortBy?.key]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  if (isLoading) return (
    <div className="w-full max-w-screen-lg p-8">
      <CircularProgress />
    </div>
  );

  return (
    <div className="w-full max-w-screen-lg px-2 py-4 md:p-8">
      <h1 className="text-xl leading-loose font-semibold">{location.name}: {properties?.length || 0} properties found</h1>
      <button ref={sortByAnchorRef} className="hover:bg-blue-50 transition-all text-sm text-blue-500 text-lg font-medium px-4 py-2 rounded-full mt-4 border border-blue-500" onClick={() => setIsSortByPopoverOpen(true)}>Sort by: {sortBy.name}</button>
      <Popover
        open={isSortByPopoverOpen}
        onClose={() => setIsSortByPopoverOpen(false)}
        anchorEl={sortByAnchorRef?.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        slotProps={popoverSlotProps}
      >
        <div className="py-1">
          <ul>
            {sortByOptions.map((sortByOption) => (
              <li key={sortByOption.key}>
                <button
                  className="hover:bg-blue-50 transition-all text-sm px-4 py-4 w-full text-left"
                  onClick={() => {
                    setSortBy(sortByOption);
                    setIsSortByPopoverOpen(false);
                  }}
                >
                  {sortByOption.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Popover>
      <div className="mt-4">
        {properties.map((property) => (
          <PropertyItem key={`property-${property.id}`} property={property} isLoading={isLoading} />
        ))}
      </div>
    </div>
  );
};

export default PropertyList;