import { useEffect, useState } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import PropTypes from 'prop-types';
import { Input } from '@/components/ui/input';

let placesLibraryPromise;

function loadPlacesLibrary(apiKey) {
  if (!placesLibraryPromise) {
    setOptions({ key: apiKey, v: 'weekly' });
    placesLibraryPromise = importLibrary('places').catch((error) => {
      placesLibraryPromise = undefined;
      throw error;
    });
  }

  return placesLibraryPromise;
}

function PlaceAutocomplete({ apiKey, onChange }) {
  const [input, setInput] = useState('');
  const [placesLibrary, setPlacesLibrary] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    loadPlacesLibrary(apiKey)
      .then((library) => {
        if (active) setPlacesLibrary(library);
      })
      .catch((loadError) => {
        console.error('Google Places failed to load:', loadError);
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [apiKey]);

  useEffect(() => {
    const query = input.trim();
    if (!placesLibrary || query.length < 3) {
      setPredictions([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const { suggestions = [] } = await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions({ input: query });
        if (active) {
          setPredictions(suggestions
            .map(({ placePrediction }) => ({
              label: placePrediction.text.toString(),
              value: placePrediction.placeId,
            }))
            .filter(({ label, value }) => label && value));
        }
      } catch (searchError) {
        console.error('Google Places autocomplete request failed:', searchError);
        if (active) {
          setPredictions([]);
          setError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [input, placesLibrary]);

  const showMenu = loading || error || predictions.length > 0;

  return (
    <div className="relative">
      <Input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Select..."
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showMenu && predictions.length > 0}
        aria-controls="destination-suggestions"
        aria-busy={loading}
      />
      {showMenu && (
        <ul
          id="destination-suggestions"
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-white py-1 shadow-md"
        >
          {loading && <li className="px-3 py-2 text-sm text-gray-500">Searching destinations...</li>}
          {error && <li className="px-3 py-2 text-sm text-red-600">Destination search failed. Check that Places API (New) is enabled for this key.</li>}
          {!loading && !error && predictions.map((prediction) => (
            <li key={prediction.value} role="option" aria-selected="false">
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                onClick={() => {
                  setInput(prediction.label);
                  setPredictions([]);
                  onChange(prediction);
                }}
              >
                {prediction.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

PlaceAutocomplete.propTypes = {
  apiKey: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PlaceAutocomplete;