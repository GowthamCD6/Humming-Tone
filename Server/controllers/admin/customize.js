const db = require('../../config/db');

// Get full customize configuration (for AdminCystamize)
exports.getCustomize = (req, res) => {
	console.log('Fetching customize configuration...');

	db.query('SELECT * FROM customize_product_categories ORDER BY display_order, id', (err, productCategories) => {
		if (err) {
			console.error('getCustomize (categories) error:', err);
			return res.status(500).json({ error: err.message });
		}

		db.query('SELECT * FROM customize_variants ORDER BY display_order, id', (err2, variants) => {
			if (err2) {
				console.error('getCustomize (variants) error:', err2);
				return res.status(500).json({ error: err2.message });
			}

			db.query('SELECT * FROM customize_colors ORDER BY display_order, id', (err3, colors) => {
				if (err3) {
					console.error('getCustomize (colors) error:', err3);
					return res.status(500).json({ error: err3.message });
				}

				db.query('SELECT * FROM customize_materials ORDER BY display_order, id', (err4, materials) => {
					if (err4) {
						console.error('getCustomize (materials) error:', err4);
						return res.status(500).json({ error: err4.message });
					}

					db.query('SELECT * FROM customize_sizes ORDER BY display_order, id', (err5, sizes) => {
						if (err5) {
							console.error('getCustomize (sizes) error:', err5);
							return res.status(500).json({ error: err5.message });
						}

						db.query('SELECT * FROM customize_gallery_designs ORDER BY display_order, id', (err6, gallery) => {
							if (err6) {
								console.error('getCustomize (gallery) error:', err6);
								return res.status(500).json({ error: err6.message });
							}

							const categoryMap = {};
							const productCategoriesMapped = (productCategories || []).map((cat) => {
								const mapped = {
									id: cat.code || String(cat.id),
									name: cat.name,
									description: cat.description || '',
									image: cat.image_path || null,
									variants: []
								};
								categoryMap[cat.id] = mapped;
								return mapped;
							});

							(variants || []).forEach((v) => {
								const parent = categoryMap[v.category_id];
								if (!parent) return;
								parent.variants.push({
									id: v.code || String(v.id),
									name: v.name,
									image: v.image_path || null
								});
							});

							const colorsMapped = (colors || []).map((c) => ({
								id: c.code || String(c.id),
								name: c.name,
								hex: c.hex || null
							}));

							const materialsMapped = (materials || []).map((m) => ({
								id: m.code || String(m.id),
								name: m.name,
								desc: m.description || '',
								image: m.image_path || null
							}));

							const sizesMapped = (sizes || []).map((s) => ({
								id: s.code || String(s.id),
								name: s.name,
								chest: s.chest || '',
								icon: s.icon || null
							}));

							const galleryMapped = (gallery || []).map((g) => ({
								id: g.code || String(g.id),
								name: g.name,
								image: g.image_path || null
							}));

							res.json({
								productCategories: productCategoriesMapped,
								colors: colorsMapped,
								materials: materialsMapped,
								sizes: sizesMapped,
								galleryDesigns: galleryMapped
							});
						});
					});
				});
			});
		});
	});
};

// Save full customize configuration from AdminCystamize into dedicated tables
exports.updateCustomize = (req, res) => {
	console.log('Updating customize content...');

	const {
		productCategories = [],
		colors = [],
		materials = [],
		sizes = [],
		galleryDesigns = []
	} = req.body || {};

	clearCustomizeTables((err) => {
		if (err) {
			console.error('updateCustomize error (clearing tables):', err);
			return res.status(500).json({ error: err.message });
		}

		insertCustomizeData(
			{ productCategories, colors, materials, sizes, galleryDesigns },
			(insertErr) => {
				if (insertErr) {
					console.error('updateCustomize error (inserting data):', insertErr);
					return res.status(500).json({ error: insertErr.message });
				}

				console.log('Customize content updated successfully');
				res.json({ message: 'Customize content saved successfully' });
			}
		);
	});
};

// Helper: clear existing customize tables before inserting new configuration
function clearCustomizeTables(callback) {
	// Order matters: variants depend on categories
	db.query('DELETE FROM customize_variants', (err) => {
		if (err) return callback(err);

		db.query('DELETE FROM customize_product_categories', (err2) => {
			if (err2) return callback(err2);

			db.query('DELETE FROM customize_colors', (err3) => {
				if (err3) return callback(err3);

				db.query('DELETE FROM customize_materials', (err4) => {
					if (err4) return callback(err4);

					db.query('DELETE FROM customize_sizes', (err5) => {
						if (err5) return callback(err5);

						db.query('DELETE FROM customize_gallery_designs', (err6) => {
							if (err6) return callback(err6);
							callback(null);
						});
					});
				});
			});
		});
	});
}

function insertCustomizeData(data, callback) {
	const { productCategories, colors, materials, sizes, galleryDesigns } = data;

	insertCustomizeCategories(productCategories, (err, categoryCodeToId) => {
		if (err) return callback(err);

		insertCustomizeVariants(productCategories, categoryCodeToId, (err2) => {
			if (err2) return callback(err2);

			insertCustomizeColors(colors, (err3) => {
				if (err3) return callback(err3);

				insertCustomizeMaterials(materials, (err4) => {
					if (err4) return callback(err4);

					insertCustomizeSizes(sizes, (err5) => {
						if (err5) return callback(err5);

						insertCustomizeGallery(galleryDesigns, (err6) => {
							if (err6) return callback(err6);
							callback(null);
						});
					});
				});
			});
		});
	});
}

function insertCustomizeCategories(productCategories, callback) {
	if (!productCategories || productCategories.length === 0) {
		return callback(null, {});
	}

	const values = productCategories.map((cat, index) => [
		cat.id || (cat.name || '').toLowerCase().replace(/\s+/g, '_'),
		cat.name || '',
		cat.description || '',
		cat.image || null,
		index,
		1
	]);

	db.query(
		'INSERT INTO customize_product_categories (code, name, description, image_path, display_order, is_active) VALUES ?',
		[values],
		(err) => {
			if (err) return callback(err);

			db.query('SELECT id, code FROM customize_product_categories', (err2, rows) => {
				if (err2) return callback(err2);

				const map = {};
				rows.forEach((row) => {
					map[row.code] = row.id;
				});

				callback(null, map);
			});
		}
	);
}

function insertCustomizeVariants(productCategories, categoryCodeToId, callback) {
	const allVariants = [];

	if (Array.isArray(productCategories)) {
		productCategories.forEach((cat) => {
			const categoryCode = cat.id || (cat.name || '').toLowerCase().replace(/\s+/g, '_');
			const categoryId = categoryCodeToId[categoryCode];

			if (!categoryId || !Array.isArray(cat.variants)) {
				return;
			}

			cat.variants.forEach((variant, variantIndex) => {
				allVariants.push([
					categoryId,
					variant.id || (variant.name || '').toLowerCase().replace(/\s+/g, '_'),
					variant.name || '',
					variant.image || null,
					variantIndex,
					1
				]);
			});
		});
	}

	if (allVariants.length === 0) {
		return callback(null);
	}

	db.query(
		'INSERT INTO customize_variants (category_id, code, name, image_path, display_order, is_active) VALUES ?',
		[allVariants],
		(err) => callback(err)
	);
}

function insertCustomizeColors(colors, callback) {
	if (!colors || colors.length === 0) {
		return callback(null);
	}

	const values = colors.map((color, index) => [
		color.id || (color.name || '').toLowerCase().replace(/\s+/g, '_'),
		color.name || '',
		color.hex || '',
		index,
		1
	]);

	db.query(
		'INSERT INTO customize_colors (code, name, hex, display_order, is_active) VALUES ?',
		[values],
		(err) => callback(err)
	);
}

function insertCustomizeMaterials(materials, callback) {
	if (!materials || materials.length === 0) {
		return callback(null);
	}

	const values = materials.map((material, index) => [
		material.id || (material.name || '').toLowerCase().replace(/\s+/g, '_'),
		material.name || '',
		material.desc || '',
		material.image || null,
		index,
		1
	]);

	db.query(
		'INSERT INTO customize_materials (code, name, description, image_path, display_order, is_active) VALUES ?',
		[values],
		(err) => callback(err)
	);
}

function insertCustomizeSizes(sizes, callback) {
	if (!sizes || sizes.length === 0) {
		return callback(null);
	}

	const values = sizes.map((size, index) => [
		size.id || (size.name || '').toLowerCase().replace(/\s+/g, '_'),
		size.name || '',
		size.chest || '',
		size.icon || null,
		index,
		1
	]);

	db.query(
		'INSERT INTO customize_sizes (code, name, chest, icon, display_order, is_active) VALUES ?',
		[values],
		(err) => callback(err)
	);
}

function insertCustomizeGallery(galleryDesigns, callback) {
	if (!galleryDesigns || galleryDesigns.length === 0) {
		return callback(null);
	}

	const values = galleryDesigns.map((design, index) => [
		design.id || (design.name || '').toLowerCase().replace(/\s+/g, '_'),
		design.name || '',
		design.image || null,
		index,
		1
	]);

	db.query(
		'INSERT INTO customize_gallery_designs (code, name, image_path, display_order, is_active) VALUES ?',
		[values],
		(err) => callback(err)
	);
}

