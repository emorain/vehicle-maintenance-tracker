// src/services/VinDecoderService.ts

export interface VinDecodeResult {
  make: string;
  model: string;
  year: number;
  trim?: string;
  engineType?: string;
  transmission?: string;
  bodyClass?: string;
}

export class VinDecoderService {
  private static NHTSA_API = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin';

  static async decodeVin(vin: string): Promise<VinDecodeResult> {
    // Validate VIN format (17 characters, alphanumeric, no I, O, Q)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    if (!vinRegex.test(vin)) {
      throw new Error('Invalid VIN format. VIN must be 17 characters.');
    }

    try {
      const response = await fetch(`${this.NHTSA_API}/${vin}?format=json`);

      if (!response.ok) {
        throw new Error('Failed to decode VIN. Please try again.');
      }

      const data = await response.json();

      if (!data.Results || data.Results.length === 0) {
        throw new Error('No data found for this VIN.');
      }

      // Extract relevant fields from NHTSA response
      const results = data.Results;
      const getValue = (variableId: number): string | null => {
        const item = results.find((r: any) => r.VariableId === variableId);
        return item?.Value || null;
      };

      const make = getValue(26) || getValue(27); // Make or Manufacturer Name
      const model = getValue(28); // Model
      const year = getValue(29); // Model Year
      const trim = getValue(109); // Trim
      const engineType = getValue(13); // Engine Number of Cylinders
      const transmission = getValue(37); // Transmission Style
      const bodyClass = getValue(5); // Body Class

      if (!make || !model || !year) {
        throw new Error('Could not decode essential vehicle information from VIN.');
      }

      return {
        make,
        model,
        year: parseInt(year),
        trim: trim || undefined,
        engineType: engineType || undefined,
        transmission: transmission || undefined,
        bodyClass: bodyClass || undefined,
      };
    } catch (error: any) {
      if (error.message.includes('Invalid VIN') || error.message.includes('Could not decode')) {
        throw error;
      }
      throw new Error('Failed to connect to VIN decoder service. Please check your internet connection.');
    }
  }

  static isValidVinFormat(vin: string): boolean {
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return vinRegex.test(vin);
  }
}
