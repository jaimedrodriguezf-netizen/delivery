<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RouteSortRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'hub_lat' => ['required', 'numeric', 'between:-90,90'],
            'hub_lng' => ['required', 'numeric', 'between:-180,180'],
            'delivery_ids' => ['required', 'array', 'min:1'],
            'delivery_ids.*' => ['required', 'string'],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'hub_lat.required' => 'La latitud del centro de distribución (hub_lat) es obligatoria.',
            'hub_lat.numeric' => 'La latitud del hub debe ser un valor numérico.',
            'hub_lat.between' => 'La latitud del hub debe estar entre -90 y 90 grados.',
            'hub_lng.required' => 'La longitud del centro de distribución (hub_lng) es obligatoria.',
            'hub_lng.numeric' => 'La longitud del hub debe ser un valor numérico.',
            'hub_lng.between' => 'La longitud del hub debe estar entre -180 y 180 grados.',
            'delivery_ids.required' => 'Debe proporcionar una lista de IDs de entregas (delivery_ids).',
            'delivery_ids.array' => 'El campo delivery_ids debe ser un arreglo de identificadores.',
            'delivery_ids.min' => 'Debe incluir al menos una entrega para optimizar la ruta.',
            'delivery_ids.*.required' => 'Cada identificador de entrega en delivery_ids es obligatorio.',
        ];
    }
}
