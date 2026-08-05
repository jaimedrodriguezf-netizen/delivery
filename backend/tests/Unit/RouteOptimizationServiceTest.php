<?php

use App\Services\RouteOptimizationService;

test('calculates accurate Haversine distance between two coordinates in Quito', function () {
    $service = new RouteOptimizationService();

    // Distance between La Carolina (-0.1800, -78.4670) and Guayaquil (-2.1894, -79.8891) ~270km
    $dist = $service->calculateHaversineDistance(-0.1800, -78.4670, -0.2200, -78.5100);

    expect($dist)->toBeGreaterThan(5.0);
    expect($dist)->toBeLessThan(10.0);
});

test('sorts deliveries by nearest neighbor starting from hub', function () {
    $service = new RouteOptimizationService();

    $hubLat = -0.1800; // La Carolina
    $hubLng = -78.4670;

    $deliveries = [
        [
            'id' => 'del-far-south',
            'delivery_address' => ['lat' => -0.3000, 'lng' => -78.5500] // Quitumbe (Far South)
        ],
        [
            'id' => 'del-near-norte',
            'delivery_address' => ['lat' => -0.1700, 'lng' => -78.4700] // El Batán (Very Near)
        ],
        [
            'id' => 'del-mid-norte',
            'delivery_address' => ['lat' => -0.1200, 'lng' => -78.4800] // Cotocollao (Mid North)
        ]
    ];

    $result = $service->sortRoute($hubLat, $hubLng, $deliveries);

    expect($result['total_stops'])->toBe(3);
    expect($result['sorted_deliveries'][0]['delivery_id'])->toBe('del-near-norte');
    expect($result['sorted_deliveries'][1]['delivery_id'])->toBe('del-mid-norte');
    expect($result['sorted_deliveries'][2]['delivery_id'])->toBe('del-far-south');
});
