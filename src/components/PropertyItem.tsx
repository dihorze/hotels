import { Star, ChevronRight, InfoOutlined, ExpandMore } from '@mui/icons-material';
import { CircularProgress, Divider, Popover } from '@mui/material';
import React, { useMemo, useRef, useState } from 'react';
import { useReduxStateSelector } from '../hooks/useReduxStateSelector';
import Agoda from '../assets/Agoda.png';
import Booking from '../assets/Booking.png';
import Expedia from '../assets/Expedia.png';
import Kayak from '../assets/Kayak.png';
import Prestigia from '../assets/Prestigia.png';
import Trip from '../assets/Trip.png';
import Stays from '../assets/Stays.png';

const COMPETITOR_LIMIT = 3;

// Mock property data
const getRandomReviewCount = () => Math.floor(Math.random() * 1000);

// Get rating label based on rating value
const getRatingLabel = (rating: number) => {
  if (rating >= 9.0) return 'Wonderful';
  if (rating >= 8.5) return 'Excellent';
  if (rating >= 8) return 'Very Good';
  if (rating >= 7) return 'Good';
  if (rating >= 6) return 'Good';
  return 'Rating';
}

// Get rounded price based on currency
const getRoundedPrice = (price: number, currency?: string) => {
  if (currency) {
    if (['USD', 'SGD', 'CNY'].includes(currency)) {
      return Math.round(price).toLocaleString();
    }
    if ([ 'KRW', 'JPY', 'IDR'].includes(currency)) {
      return (Math.round(price / 100) * 100).toLocaleString();
    }
  }
  return Number(price.toFixed(2)).toLocaleString();
}

const getCompetitorLogoComponent = (competitor: string) => {
  switch (competitor) {
    case 'Agoda':
      return <img className="h-full" src={Agoda} alt={competitor} />;
    case 'Agoda.com':
      return <img className="h-full" src={Agoda} alt={competitor} />;
    case 'Booking':
      return <img className="h-full" src={Booking} alt={competitor} />;
    case 'Booking.com':
      return <img className="h-full" src={Booking} alt={competitor} />;
    case 'Expedia':
      return <img className="h-full" src={Expedia} alt={competitor} />;
    case 'Kayak':
      return <img className="h-full" src={Kayak} alt={competitor} />;
    case 'Prestigia':
      return <img className="h-full" src={Prestigia} alt={competitor} />;
    case 'Trip':
      return <img className="h-full" src={Trip} alt={competitor} />;
    case 'Stays.com':
      return <img className="h-full" src={Stays} alt={competitor} />;
    default:
      return (
        <div className="h-full flex justify-center align-center">
          <p className="leading-6">{competitor}</p>
        </div>
      );
  }
}

const currencySigns: { [currency: string]: string } = {
  USD: 'US$',
  SGD: 'S$',
  CNY: 'CNY',
  KRW: 'KRW',
  JPY: '¥',
  IDR: 'Rp',
};

interface PropertyItemProps {
  property: Property;
  isLoading?: boolean;
}

const PropertyItem: React.FC<PropertyItemProps> = ({ property, isLoading }) => {
  const currency = useReduxStateSelector((state) => state.currency);
  const [isPricePopoverOpen, setIsPricePopoverOpen] = useState(false);
  const [isCompetitorPopoverOpen, setIsCompetitorPopoverOpen] = useState(false);

  const pricePopoverAnchorRef = useRef<HTMLDivElement>(null);
  const competitorPopoverAnchorRef = useRef<HTMLLIElement>(null);

  const reviewCount = useMemo(() => getRandomReviewCount(), []);

  // Get property price
  const price = useMemo(() => property?.propertyPrice?.price || 0, [property?.propertyPrice?.price]);

  const competitors = useMemo(() => {
    const entries = Object.entries(property?.propertyPrice?.competitors || {});

    // Add us as a competitor
    if (price && entries.length > 0) entries.unshift(['Stays.com', price] as [string, number]);

    // Sort competitors based on price
    entries.sort((a, b) => a[1] - b[1]);

    return entries;
  }, [property?.propertyPrice?.competitors, price]);

  // Get the highest price among competitors
  const highestPrice = useMemo(() => competitors.length > 0 ? competitors[competitors.length - 1][1] : 0, [competitors]);

  // Calculate saving
  const saving = useMemo(() => {
    if (price && highestPrice) {
      return Math.round((highestPrice - price) / highestPrice * 100);
    }
    return 0;
  }, [price, highestPrice]);

  const currencySign = useMemo(() => currency ? currencySigns[currency] : '', [currency]);
  const priceString = property.propertyPrice ? `${currencySign} ${getRoundedPrice(price, currency)}` : 'Rates unavailable';

  return (
    <div className="flex flex-row items-start p-4 mb-4 border border-gray-300 rounded-lg">
      <img className="w-60 max-w-[40%] h-60 rounded-lg mr-4 cursor-pointer select-none object-cover" src={property?.photo} alt={property?.name} draggable={false} />
      <div className="flex-1 flex flex-col md:flex-row min-h-60">
        <div className="md:flex-1 flex flex-col mr-4">
          <div className="flex flex-row items-center flex-wrap">
            <h2 className="mr-2 text-base/tight md:text-xl/tight text-blue-500 hover:text-black font-bold tracking-wide select-none cursor-pointer">{property?.name}</h2>
            <div className="flex flex-row items-center">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} fontSize="small" className={index < property?.stars ? 'text-yellow-500' : 'text-gray-300'} />
              ))}
            </div>
          </div>
          <p className="hidden md:flex mt-2 text-gray-600 md:text-[12px]">{property?.address}</p>
          {saving > 0 && (
            <div className="flex flex-row items-center mt-2">
              <div className="px-1 py-0.5 bg-green-700 text-white text-[12px] rounded">Save {saving}%</div>
            </div>
          )}
          <div className="flex-1 hidden md:flex flex-col justify-end mt-2">
            <ul>
              {competitors?.length > 0 && competitors.slice(0, competitors.length > COMPETITOR_LIMIT ? COMPETITOR_LIMIT - 1 : COMPETITOR_LIMIT).map(([competitor, price]) => (
                <li key={competitor} className="flex flex-col rounded hover:bg-gray-200 cursor-pointer">
                  <Divider />
                  <div className="flex flex-row justify-between items-center h-6 px-2 my-2">
                    {getCompetitorLogoComponent(competitor)}
                    <p className="text-sm text-gray-600">{currencySign} {getRoundedPrice(price, currency)}</p>
                  </div>
                </li>
              ))}
              {competitors.length > COMPETITOR_LIMIT && (
                <li className="flex flex-col rounded hover:bg-gray-200 cursor-pointer" ref={competitorPopoverAnchorRef}>
                  <Divider />
                  <div className="flex flex-row justify-between items-center h-6 px-2 my-2" onClick={() => setIsCompetitorPopoverOpen(true)}>
                    <div className="flex flex-row items-center h-full">
                      {getCompetitorLogoComponent(competitors[COMPETITOR_LIMIT - 1][0])}
                      <p className="text-sm text-gray-600 ml-1.5 mr-1">and {competitors.length - COMPETITOR_LIMIT} more</p>
                      <ExpandMore sx={{ transition: 'all 300ms', fontSize: '1rem' }} className={isCompetitorPopoverOpen ? 'transform rotate-180' : ''} fontSize="small" />
                    </div>
                    <p className="text-sm text-gray-600">{currencySign} {getRoundedPrice(competitors[COMPETITOR_LIMIT - 1][1], currency)}</p>
                  </div>
                  <Popover
                    open={isCompetitorPopoverOpen}
                    anchorEl={competitorPopoverAnchorRef.current}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    onClose={() => setIsCompetitorPopoverOpen(false)}
                    disableRestoreFocus
                  >
                    <div className="min-w-80 bg-white rounded-lg" style={{ width: competitorPopoverAnchorRef.current?.clientWidth }}>
                      {competitors.slice(COMPETITOR_LIMIT - 1).map(([competitor, price]) => (
                        <div key={competitor} className="flex flex-row justify-between items-center px-4 py-2 hover:bg-gray-200 cursor-pointer">
                          <div className="h-8 flex justify-center align-center">
                            <p className="leading-8">{competitor}</p>
                          </div>
                          <p className="text-sm text-gray-600">{currencySign} {getRoundedPrice(price, currency)}</p>
                        </div>
                      ))}
                    </div>
                  </Popover>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="flex flex-col justify-between mt-3 items-start flex-1 md:mt-0 md:flex-initial md:items-end">
          <div className="flex flex-row-reverse md:flex-row">
            <div className="flex flex-col items-start md:items-end justify-center mx-2">
              <p className="leading-tight">{getRatingLabel(property?.rating)}</p>
              <p className="text-[12px] text-gray-600">{reviewCount} reviews</p>
            </div>
            <div className="bg-blue-700 text-normal text-white w-9 h-9 rounded-lg md:rounded-bl-none flex justify-center items-center">{property?.rating}</div>
          </div>
          <div className="flex flex-col items-end w-full mt-2" data-testid={`property-price_${property.id}`}>
            {isLoading ? <CircularProgress size={24} /> :
              <>
                <p className="text-[12px] text-gray-600">1 night, 2 adults</p>
                <div className={`flex flex-${priceString.length > 8 ? 'col' : 'row'} items-end justify-end`}>
                  {highestPrice > price && <p className="text-sm text-red-500 line-through">{currencySign} {getRoundedPrice(highestPrice, currency)}</p>}
                  <p className="ml-1 text-xl/tight text-right font-semibold">{priceString}</p>
                </div>
                {property.propertyPrice?.taxes_and_fees && (
                  <div className="flex flex-row items-end" ref={pricePopoverAnchorRef} onMouseEnter={() => setIsPricePopoverOpen(true)} onMouseLeave={() => setIsPricePopoverOpen(false)}>
                    <p className="text-[12px] text-gray-600 cursor-default">includes taxes & fees</p>
                    <InfoOutlined fontSize="small" className="text-gray-500 ml-1" />
                    <Popover
                      open={isPricePopoverOpen}
                      anchorEl={pricePopoverAnchorRef.current}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      onClose={() => setIsPricePopoverOpen(false)}
                      disableRestoreFocus
                    >
                      <div className="p-4 w-80 bg-white rounded-lg shadow-lg" onMouseLeave={() => setIsPricePopoverOpen(false)}>
                        <div className="flex flex-row items-center justify-between">
                          <p className="text-sm/loose">Hotel fees:</p>
                          <p className="text-sm/loose">{currencySign} {getRoundedPrice(property.propertyPrice?.taxes_and_fees.hotel_fees, currency)}</p>
                        </div>
                        <div className="flex flex-row items-center justify-between">
                          <p className="text-sm/loose">Taxes:</p>
                          <p className="text-sm/loose">{currencySign} {getRoundedPrice(property.propertyPrice?.taxes_and_fees.tax, currency)}</p>
                        </div>
                        <div className="flex flex-row items-center justify-between">
                          <p className="text-sm/loose">Base price:</p>
                          <p className="text-sm/loose">{currencySign} {getRoundedPrice(price - property.propertyPrice?.taxes_and_fees.hotel_fees - property.propertyPrice?.taxes_and_fees.tax, currency)}</p>
                        </div>
                        <Divider sx={{ margin: '8px 0' }}/>
                        <div className="flex flex-row items-center justify-between">
                          <p className="text-sm/loose font-semibold">Total:</p>
                          <p className="text-sm/loose font-semibold">{currencySign} {getRoundedPrice(price, currency)}</p>
                        </div>
                      </div>
                    </Popover>
                  </div>
                )}
              </>
            }
            <button className="hidden md:flex flex-row bg-blue-500 hover:bg-blue-400 transition-all text-white mt-4 mb-8 pl-3.5 pr-1.5 py-2 rounded">
              <p className="text-sm mr-1">See Availability</p>
              <ChevronRight fontSize="small" />
            </button>
          </div>
        </div>
          
      </div>
    </div>
  );
};

export default PropertyItem;