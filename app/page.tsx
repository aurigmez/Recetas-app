 'use client';

import React, { useMemo, useState } from 'react';

type MacroValues = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  base: string;
};

type IngredientItem = {
  name: string;
  amount: number;
  unit: string;
};

type Recipe = {
  id: number;
  name: string;
  category: string;
  favorite: boolean;
  servings: number;
  instructions: string;
  ingredients: IngredientItem[];
};

const ingredientDB: Record<string, MacroValues> = {
  'Camote cocido': { kcal: 86, protein: 1.6, carbs: 20.1, fat: 0.1, base: '100 g' },
  'Cottage cheese': { kcal: 98, protein: 11.1, carbs: 3.4, fat: 4.3, base: '100 g' },
  'Proteína whey': { kcal: 120, protein: 24, carbs: 3, fat: 1.5, base: '30 g' },
  Huevo: { kcal: 70, protein: 6, carbs: 0.4, fat: 5, base: '1 pieza' },
  'Cocoa en polvo': { kcal: 24, protein: 2, carbs: 6, fat: 1.5, base: '10 g' },
  'Yogurt griego': { kcal: 59, protein: 10, carbs: 3.6, fat: 0.4, base: '100 g' },
  Avena: { kcal: 389, protein: 16.9, carbs: 66.3, fat: 6.9, base: '100 g' },
  'Leche light': { kcal: 42, protein: 3.4, carbs: 5, fat: 1, base: '100 ml' },
};

const starterRecipes: Recipe[] = [
  {
    id: 1,
    name: 'Brownie fit de camote',
    category: 'Postre',
    favorite: true,
    servings: 4,
    instructions: 'Licúa o procesa todo, vierte en molde y hornea hasta que cuaje.',
    ingredients: [
      { name: 'Camote cocido', amount: 300, unit: 'g' },
      { name: 'Cottage cheese', amount: 150, unit: 'g' },
      { name: 'Proteína whey', amount: 30, unit: 'g' },
      { name: 'Huevo', amount: 2, unit: 'pieza' },
      { name: 'Cocoa en polvo', amount: 10, unit: 'g' },
    ],
  },
  {
    id: 2,
    name: 'Bowl proteico de yogurt',
    category: 'Desayuno',
    favorite: false,
    servings: 1,
    instructions: 'Mezcla el yogurt con proteína y agrega toppings al gusto.',
    ingredients: [
      { name: 'Yogurt griego', amount: 200, unit: 'g' },
      { name: 'Proteína whey', amount: 15, unit: 'g' },
      { name: 'Avena', amount: 20, unit: 'g' },
    ],
  },
];

function convertFactor(ingredientName: string, amount: number, unit: string) {
  if (ingredientName === 'Proteína whey') return amount / 30;
  if (ingredientName === 'Huevo') return amount;
  if (unit === 'ml') return amount / 100;
  return amount / 100;
}

function getRecipeMacros(recipe: Recipe) {
  return recipe.ingredients.reduce(
    (acc, item) => {
      const db = ingredientDB[item.name];
      if (!db) return acc;
      const factor = convertFactor(item.name, item.amount, item.unit);
      acc.kcal += db.kcal * factor;
      acc.protein += db.protein * factor;
      acc.carbs += db.carbs * factor;
      acc.fat += db.fat * factor;
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function round(num: number) {
  return Math.round(num * 10) / 10;
}

export default function Page() {
  const [recipes, setRecipes] = useState<Recipe[]>(starterRecipes);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    category: 'Snack',
    servings: 1,
    instructions: '',
    ingredients: [{ name: 'Camote cocido', amount: 100, unit: 'g' }],
  });

  const categories = ['Todas', ...Array.from(new Set(recipes.map((r) => r.category)))];

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'Todas' || recipe.category === category;
      const matchesFavorite = !showFavorites || recipe.favorite;
      return matchesSearch && matchesCategory && matchesFavorite;
    });
  }, [recipes, search, category, showFavorites]);

  const selectedRecipe = recipes.find((r) => r.id === selectedId) || filteredRecipes[0];
  const selectedMacros = selectedRecipe ? getRecipeMacros(selectedRecipe) : null;

  function toggleFavorite(id: number) {
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r)));
  }

  function deleteRecipe(id: number) {
    const updated = recipes.filter((r) => r.id !== id);
    setRecipes(updated);
    if (selectedId === id && updated.length) setSelectedId(updated[0].id);
  }

  function updateIngredient(index: number, field: 'name' | 'amount' | 'unit', value: string | number) {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addIngredientRow() {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: 'Cottage cheese', amount: 100, unit: 'g' }],
    }));
  }

  function saveRecipe() {
    if (!newRecipe.name.trim()) return;

    const recipe: Recipe = {
      ...newRecipe,
      id: Date.now(),
      favorite: false,
      servings: Number(newRecipe.servings) || 1,
      ingredients: newRecipe.ingredients.map((i) => ({
        ...i,
        amount: Number(i.amount) || 0,
      })),
    };

    setRecipes((prev) => [recipe, ...prev]);
    setSelectedId(recipe.id);
    setShowNewForm(false);
    setNewRecipe({
      name: '',
      category: 'Snack',
      servings: 1,
      instructions: '',
      ingredients: [{ name: 'Camote cocido', amount: 100, unit: 'g' }],
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recetas & Macros</h1>
            <p className="mt-2 text-sm text-slate-600">
              Guarda tus recetas, calcula macros y encuentra todo rápido.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Recetas</p>
              <p className="text-xl font-semibold">{recipes.length}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Favoritas</p>
              <p className="text-xl font-semibold">{recipes.filter((r) => r.favorite).length}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Tus recetas</h2>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar receta..."
              className="mb-3 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
            />

            <div className="mb-3 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm ${
                    category === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`flex-1 rounded-2xl px-4 py-3 ${
                  showFavorites ? 'bg-slate-900 text-white' : 'bg-slate-100'
                }`}
              >
                Solo favoritas
              </button>

              <button
                onClick={() => setShowNewForm(!showNewForm)}
                className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-white"
              >
                {showNewForm ? 'Cerrar' : 'Nueva receta'}
              </button>
            </div>

            {showNewForm && (
              <div className="mb-4 rounded-2xl bg-slate-100 p-3">
                <div className="space-y-3">
                  <input
                    placeholder="Nombre de la receta"
                    value={newRecipe.name}
                    onChange={(e) => setNewRecipe((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  />

                  <input
                    placeholder="Categoría"
                    value={newRecipe.category}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  />

                  <input
                    type="number"
                    placeholder="Porciones"
                    value={newRecipe.servings}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({
                        ...prev,
                        servings: Number(e.target.value) || 1,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  />

                  <textarea
                    placeholder="Instrucciones"
                    value={newRecipe.instructions}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({ ...prev, instructions: e.target.value }))
                    }
                    className="min-h-[90px] w-full rounded-2xl border border-slate-300 px-4 py-3"
                  />

                  {newRecipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2">
                      <select
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                        className="rounded-2xl border border-slate-300 px-3 py-3"
                      >
                        {Object.keys(ingredientDB).map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        value={ingredient.amount}
                        onChange={(e) => updateIngredient(index, 'amount', Number(e.target.value))}
                        className="rounded-2xl border border-slate-300 px-3 py-3"
                      />

                      <select
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        className="rounded-2xl border border-slate-300 px-3 py-3"
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="pieza">pieza</option>
                      </select>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <button
                      onClick={addIngredientRow}
                      className="flex-1 rounded-2xl bg-white px-4 py-3"
                    >
                      Agregar ingrediente
                    </button>
                    <button
                      onClick={saveRecipe}
                      className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-white"
                    >
                      Guardar receta
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {filteredRecipes.map((recipe) => {
                const macros = getRecipeMacros(recipe);
                const isActive = selectedRecipe?.id === recipe.id;

                return (
                  <button
                    key={recipe.id}
                    onClick={() => setSelectedId(recipe.id)}
                    className={`w-full rounded-2xl border p-4 text-left ${
                      isActive ? 'border-slate-900 bg-slate-100' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{recipe.name}</p>
                        <p className="text-sm text-slate-500">{recipe.category}</p>
                      </div>

                      <div className="flex gap-2">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(recipe.id);
                          }}
                          className="cursor-pointer"
                        >
                          {recipe.favorite ? '❤️' : '🤍'}
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRecipe(recipe.id);
                          }}
                          className="cursor-pointer"
                        >
                          🗑️
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-200 px-3 py-1">
                        {round(macros.kcal)} kcal
                      </span>
                      <span className="rounded-full bg-slate-200 px-3 py-1">
                        P {round(macros.protein)} g
                      </span>
                      <span className="rounded-full bg-slate-200 px-3 py-1">
                        C {round(macros.carbs)} g
                      </span>
                      <span className="rounded-full bg-slate-200 px-3 py-1">
                        G {round(macros.fat)} g
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-6">
            {selectedRecipe && selectedMacros ? (
              <>
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedRecipe.name}</h2>
                      <p className="text-sm text-slate-500">{selectedRecipe.category}</p>
                    </div>
                    <div className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
                      {selectedRecipe.servings} porciones
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl bg-slate-100 p-4">
                      <p className="text-sm text-slate-500">Calorías</p>
                      <p className="text-xl font-semibold">{round(selectedMacros.kcal)} kcal</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-4">
                      <p className="text-sm text-slate-500">Proteína</p>
                      <p className="text-xl font-semibold">{round(selectedMacros.protein)} g</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-4">
                      <p className="text-sm text-slate-500">Carbs</p>
                      <p className="text-xl font-semibold">{round(selectedMacros.carbs)} g</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-4">
                      <p className="text-sm text-slate-500">Grasa</p>
                      <p className="text-xl font-semibold">{round(selectedMacros.fat)} g</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm text-slate-500">Kcal por porción</p>
                      <p className="text-lg font-semibold">
                        {round(selectedMacros.kcal / selectedRecipe.servings)} kcal
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm text-slate-500">Prote por porción</p>
                      <p className="text-lg font-semibold">
                        {round(selectedMacros.protein / selectedRecipe.servings)} g
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm text-slate-500">Carbs por porción</p>
                      <p className="text-lg font-semibold">
                        {round(selectedMacros.carbs / selectedRecipe.servings)} g
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm text-slate-500">Grasa por porción</p>
                      <p className="text-lg font-semibold">
                        {round(selectedMacros.fat / selectedRecipe.servings)} g
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr,320px]">
                  <div className="rounded-3xl bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-xl font-semibold">Ingredientes e instrucciones</h3>

                    <div className="mb-5">
                      <p className="mb-3 text-sm font-medium text-slate-500">Ingredientes</p>
                      <div className="space-y-2">
                        {selectedRecipe.ingredients.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3"
                          >
                            <span className="font-medium">{item.name}</span>
                            <span className="text-sm text-slate-500">
                              {item.amount} {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-medium text-slate-500">Preparación</p>
                      <div className="rounded-2xl border border-slate-200 p-4 text-slate-700">
                        {selectedRecipe.instructions || 'Sin instrucciones todavía.'}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-xl font-semibold">Base de macros</h3>
                    <div className="space-y-3">
                      {Object.entries(ingredientDB).map(([name, values]) => (
                        <div key={name} className="rounded-2xl bg-slate-100 p-3">
                          <p className="font-medium">{name}</p>
                          <p className="text-xs text-slate-500">Base: {values.base}</p>
                          <p className="mt-1 text-xs text-slate-600">
                            {values.kcal} kcal · P {values.protein} · C {values.carbs} · G{' '}
                            {values.fat}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
                No hay recetas todavía.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
export default function Home() {
  return <h1>Hola mundo 👀</h1>;
}