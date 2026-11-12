<?php
// Laravel version of the checkout flow shown in the video.
// Put the classes from ../checkout.php into app/Delivery/ (DeliveryStrategy, StandardDelivery,
// ExpressDelivery) and app/Services/CheckoutService.php with namespaces, then add the route:
//   Route::post('/checkout/delivery-fee', [CheckoutController::class, 'deliveryFee']);

namespace App\Http\Controllers;

use App\Delivery\ExpressDelivery;
use App\Delivery\StandardDelivery;
use App\Services\CheckoutService;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function deliveryFee(Request $request)
    {
        $data = $request->validate([
            'delivery_method' => 'required|in:standard,express',
        ]);

        $strategy = match ($data['delivery_method']) {
            'standard' => new StandardDelivery(),
            'express' => new ExpressDelivery(),
        };

        $service = new CheckoutService($strategy);

        return response()->json([
            'delivery_method' => $data['delivery_method'],
            'km' => 4,
            'fee' => $service->deliveryFee(4), // standard → 60, express → 100
        ]);
    }
}
