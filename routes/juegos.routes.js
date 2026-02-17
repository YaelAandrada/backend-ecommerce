import express from "express";
const router = express.Router();

let juegos = [
    {
        id: 1,
        nombre: "Minecraft",
        precio: 200000,
        categoria: "aventura",
        imagen: "https:",
        desarrollador: "Mojang Studios",

    }
];

// get todos los juegos
router.get("/", (req, res) => {
    res.json(juegos);
});

//get un solo juego
router.get("/:id", (req, res) => {
    const juego = juegos.find((juego) => juego.id == req.params.id);
    if(!juego) return res.status(404).json({error: "Juego no encontrado"});
    res.json(juego);

});

//POST crear juego
router.post("/", (req, res) => {
    const nuevo = { id: Date.now(), ...req.body };
    juegos.push(nuevo);
    res.status(201).json(nuevo);
});

// PUT editar juego
router.put("/:id", (req, res) => {
    juegos = juegos.map((juego) => {
        juegos.id == req.params.id ? {...juego, ...req.body} : juego
    })
    res.json({msg: "Juego actualizado"});
});

// DELETE borrar juegos
router.delete("/:id", (req, res) => {
    juegos = juegos.filter((juego) => juego.id != req.params.id);
    res.json({msg: "Juego borrado"});
});
export default router;