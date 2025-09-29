import { Preferences } from '@capacitor/preferences';

export const saveTrip = async (trip: any) => {
    const { value } = await Preferences.get({ key: 'trips' });
    const trips = value ? JSON.parse(value) : [];
    trips.push(trip);
    await Preferences.set({ key: 'trips', value: JSON.stringify(trips) });
};

export const getTrips = async () => {
    const { value } = await Preferences.get({ key: 'trips' });
    return value ? JSON.parse(value) : [];
};
