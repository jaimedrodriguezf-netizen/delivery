<?php

namespace App\Services;

class RouteOptimizationService
{
    /**
     * Earth radius in kilometers.
     */
    private const EARTH_RADIUS_KM = 6371.0;

    /**
     * Sorts a list of deliveries starting from hub coordinates using nearest-neighbor heuristic.
     *
     * @param float $hubLat Starting hub latitude
     * @param float $hubLng Starting hub longitude
     * @param array $deliveries Array of delivery records (each must contain id, delivery_address with lat and lng)
     * @return array Array containing hub metadata, total_stops, total_distance_km, and sorted_deliveries
     */
    public function sortRoute(float $hubLat, float $hubLng, array $deliveries): array
    {
        if (empty($deliveries)) {
            return [
                'hub' => ['lat' => $hubLat, 'lng' => $hubLng],
                'total_stops' => 0,
                'total_distance_km' => 0.0,
                'sorted_deliveries' => [],
            ];
        }

        $remaining = [];
        foreach ($deliveries as $del) {
            $address = is_array($del['delivery_address'] ?? null)
                ? $del['delivery_address']
                : json_decode($del['delivery_address'] ?? '{}', true);

            $lat = (float) ($address['lat'] ?? 0.0);
            $lng = (float) ($address['lng'] ?? 0.0);

            $remaining[] = [
                'raw_delivery' => $del,
                'id' => (string) ($del['id'] ?? ''),
                'lat' => $lat,
                'lng' => $lng,
                'address' => $address,
            ];
        }

        $sortedStops = [];
        $currentLat = $hubLat;
        $currentLng = $hubLng;
        $cumulativeDistance = 0.0;
        $sequence = 1;

        while (!empty($remaining)) {
            $closestIndex = null;
            $minDistance = PHP_FLOAT_MAX;

            foreach ($remaining as $index => $candidate) {
                $dist = $this->calculateHaversineDistance(
                    $currentLat,
                    $currentLng,
                    $candidate['lat'],
                    $candidate['lng']
                );

                if ($dist < $minDistance) {
                    $minDistance = $dist;
                    $closestIndex = $index;
                }
            }

            if ($closestIndex === null) {
                break;
            }

            $selected = $remaining[$closestIndex];
            array_splice($remaining, $closestIndex, 1);

            $minDistanceFormatted = round($minDistance, 2);
            $cumulativeDistance += $minDistanceFormatted;

            $sortedStops[] = [
                'delivery_id' => $selected['id'],
                'sequence' => $sequence,
                'lat' => $selected['lat'],
                'lng' => $selected['lng'],
                'distance_from_prev_km' => $minDistanceFormatted,
                'cumulative_distance_km' => round($cumulativeDistance, 2),
                'address' => $selected['address'],
                'delivery' => $selected['raw_delivery'],
            ];

            $currentLat = $selected['lat'];
            $currentLng = $selected['lng'];
            $sequence++;
        }

        return [
            'hub' => [
                'lat' => $hubLat,
                'lng' => $hubLng,
            ],
            'total_stops' => count($sortedStops),
            'total_distance_km' => round($cumulativeDistance, 2),
            'sorted_deliveries' => $sortedStops,
        ];
    }

    /**
     * Calculates great-circle distance between two points on Earth using Haversine formula.
     */
    public function calculateHaversineDistance(
        float $lat1,
        float $lng1,
        float $lat2,
        float $lng2
    ): float {
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return self::EARTH_RADIUS_KM * $c;
    }
}
