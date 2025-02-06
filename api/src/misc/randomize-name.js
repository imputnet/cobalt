const names = ['nickel', 'zinc', 'gallium', 'silicon', 'copper', 'aluminium', 'calcium', 'magnesium', 'titanium'];

export function randomizeName() {
    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
}
