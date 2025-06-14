import {
    mdiTruckDelivery,
    mdiParking,
    mdiPaw,
    mdiCreditCardCheck,
    mdiTeddyBear,
    mdiSmoking,
    mdiSproutOutline,
    mdiFoodApple,
    mdiBarley,
    mdiFoodHalal,
    mdiHelpCircle
} from "@mdi/js";

export function getAmenityIcon(code) {
    const iconMap = {
        DELIV: mdiTruckDelivery,
        PARK: mdiParking,
        PET: mdiPaw,
        CARD: mdiCreditCardCheck,
        KIDS: mdiTeddyBear,
        SMOK: mdiSmoking,
        VEGAN: mdiSproutOutline,
        VEGE: mdiFoodApple,
        GLUT: mdiBarley,
        HALAL: mdiFoodHalal
    };
    return iconMap[code] || mdiHelpCircle;
}
