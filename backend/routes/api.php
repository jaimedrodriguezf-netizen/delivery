<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\DeliveryRouteController;

/*
|--------------------------------------------------------------------------
| API Routes - Delivery & Optimization Domain
|--------------------------------------------------------------------------
|
| Here is where API routes for the delivery system are registered.
|
*/

Route::prefix('v1')->group(function () {
    Route::prefix('deliveries')->group(function () {
        Route::post('/route-sort', [DeliveryRouteController::class, 'sortRoute'])
            ->name('api.v1.deliveries.route-sort');
    });
});
