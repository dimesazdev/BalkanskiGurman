export function getAmenityIcon(code) {
    const iconMap = {
        DELIV: 'truck-delivery',
        PARK: 'parking',
        PET: 'paw',
        CARD: 'credit-card-check',
        KIDS: 'teddy-bear',
        SMOK: 'smoking',
        VEGAN: 'sprout-outline',
        VEGE: 'food-apple',
        GLUT: 'barley',
        HALAL: 'food-halal'
    };
    return iconMap[code] || 'help-circle-outline';
}