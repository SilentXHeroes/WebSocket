// Résolution du coefficient "t" de l'équation de bézier
// Sources: 
//  - https://www.1728.org/cubic.htm
//  - http://jsfiddle.net/z2c60vgk/13/
function resolveCubicEquation(a, b, c, d) {
    var f = (((3*c)/a) - ((Math.pow(b,2) / Math.pow(a,2)))) / 3;
    var g = (2*(Math.pow(b, 3) / Math.pow(a,3))-(9*b*c/Math.pow(a,2)) + ((27*(d/a)))) / 27;
    var h = (Math.pow(g,2) / 4) + (Math.pow(f,3) / 27);

    if ((f + g + h) === 0)
    {
        if (d < 0) return Math.pow((d*-1/a), 1/3);
    	return Math.pow((d/a), 1/3) * -1;
    }
    
    if (h > 0)
    {			        
        let m = (g/2) * -1 + Math.sqrt(h);
        let k = m < 0 ? -1 : 1;
        let m2 = Math.pow((m*k), 1/3) * k;
        let n = g/2 * -1 - Math.sqrt(h);
        k = n < 0 ? -1 : 1;
        let n2 = Math.pow((n*k),(1/3)) * k;

        return (m2 + n2) - (b/(3*a));			        
    }

    let r = Math.sqrt((Math.pow(g,2)/4) - h);
    let k = r < 0 ? -1 : 1;
    let rc = Math.pow((r*k), 1/3)*k;
    let theta = Math.acos(g/(2*r)*-1);
    x = 2 * (rc*Math.cos(theta/3)) - (b/(3*a));
    return Math.round(x * 1E+14) / 1E+14;
}

// Retourne l'équation de droite pour 2 points donnés
function getLineEquation(...args) {
	let pA, pB;
	if(args.length === 4) {
		pA = { x: args[0], y: args[1] };
		pB = { x: args[2], y: args[3] };
	}
	else if(args.length === 2) {
		pA = args[0];
		pB = args[1];
	}
	else {
		return null;
	}

	let diff = {
		x: pB.x - pA.x,
		y: pB.y - pA.y
	};

	// m = By - Ay / Bx - Ax
	let m = (pB.y - pA.y) / (pB.x - pA.x);
	// p = Ay - m * Ax <=> p = Ay - (By - Ay / Bx - Ax) * Ax
	let p = pA.y - m * pA.x;
	return {
		m: m,
		p: p,
		// Ecart entre l'abscisse et l'ordonnée
		diff: diff,
		// Longueur de la ligne, utilisation de Pythagore (racine de la somme des côtés au carré)
		length: Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2)),
		// Retourne la coordonnée Y avec l'abscisse X
		Fx: x => m * x + p,
		// Retourne la coordonnée X avec l'ordonnée Y
		Fy: y => (y - p) / m
	};
}