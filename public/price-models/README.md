# Price Models Documentation

## Adding New Price Models

To add a new electricity provider's pricing model, create a JSON file in this directory with the following structure:

```json
{
  "name": "Provider Name",
  "currency": "SEK",
  "vat_rate": 0.25,
  "prices_include_tax": true,
  "fixed_fee_per_month": 350.0,
  "usage_fee_per_kwh": 0.065,
  "power_tariffs": [
    {
      "name": "Standard Tariff",
      "fee_per_kw": 60.0,
      "number_of_top_peaks_to_average": 3,
      "months": [11, 12, 1, 2, 3],
      "start_time": "07:00",
      "end_time": "22:00",
      "reduction": {
        "factor": 0.5,
        "start_time": "22:00",
        "end_time": "06:00"
      }
    }
  ]
}
```

### Parameters Explanation

**Required Fields:**

- `name`: Display name for the model
- `currency`: 3-letter currency code (SEK, EUR, USD, etc.)
- `fixed_fee_per_month`: Monthly fixed cost in currency units
- `usage_fee_per_kwh`: Cost per kWh in currency units
- `vat_rate`: VAT/tax rate as decimal (0.25 = 25%)
- `prices_include_tax`: Whether prices already include tax

**Power Tariff Fields:**

- `name`: Tariff display name
- `fee_per_kw`: Cost per kW in currency units
- `number_of_top_peaks_to_average`: Number of peak hours to average (usually 2-5)
- `peak_calculation_method`: `"standard"` or `"night_reduced"`
- `months`: Array of active months [1-12] (optional)
- `start_time` / `end_time`: Time restrictions in "HH:MM" format (optional)

**Reduction Fields:**

- `factor`: Factor to multiply reduction-time peaks (0.5 = 50%)
- `start_time`: When reduction period starts ("22:00")
- `end_time`: When reduction period ends ("06:00")

## Calculation Logic

1. Filter data by month and time restrictions
2. Apply reduction factor to night-time hours
3. Find highest usage hour per day
4. Take average of top N daily peaks
5. Multiply by tariff rate

## Model Management

Add your model filename to `models-index.json` for organized loading:

```json
{
  "models": [
    "jönköping-energi-20a.json",
    "vattenfall-standard.json",
    "e-on-basic.json",
    "ellevio-standard.json",
    "your-new-model.json"
  ],
  "last_updated": "2025-07-30"
}
```

The system will automatically validate model structure and show helpful error messages for any issues.
