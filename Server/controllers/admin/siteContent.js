const db = require('../../config/db');

exports.getSiteContent = (req, res) => {
    console.log('Fetching site content...');
    
    // Use callbacks instead of promises
    db.query("SELECT * FROM site_settings WHERE id = 1", (err, settings) => {
        if (err) {
            console.error('getSiteContent error:', err);
            return res.status(500).json({ error: err.message });
        }
        
        db.query("SELECT * FROM footer_links ORDER BY display_order", (err, links) => {
            if (err) {
                console.error('getSiteContent error:', err);
                return res.status(500).json({ error: err.message });
            }
            
            db.query("SELECT * FROM genders ORDER BY display_order", (err, genders) => {
                if (err) {
                    console.error('getSiteContent error:', err);
                    return res.status(500).json({ error: err.message });
                }
                
                db.query("SELECT * FROM categories", (err, categories) => {
                    if (err) {
                        console.error('getSiteContent error:', err);
                        return res.status(500).json({ error: err.message });
                    }
                    
                    const brandData = settings[0] || {};
                    
                    // Parse JSON fields safely
                    const socialLinks = brandData.social_links 
                        ? (typeof brandData.social_links === 'string' 
                            ? JSON.parse(brandData.social_links) 
                            : brandData.social_links)
                        : {};
                        
                    const legalInfo = brandData.legal_info
                        ? (typeof brandData.legal_info === 'string'
                            ? JSON.parse(brandData.legal_info)
                            : brandData.legal_info)
                        : { copyright: '© 2025 humming tone | All rights reserved.' };
                    
                    // Prepare gender data
                    const genderCategory = {};
                    genders.forEach(g => {
                        genderCategory[g.name] = categories
                            .filter(c => c.gender_name === g.name)
                            .map(c => c.name);
                    });
                    
                    const genderStatus = {};
                    genders.forEach(g => { 
                        genderStatus[g.name] = !!g.is_active; 
                    });

                    // Build response
                    const response = {
                        footer: {
                            brandName: brandData.brand_name || 'Humming & Tone',
                            description: brandData.description || 'Your premier destination for stylish and affordable fashion.',
                            company: { 
                                email: brandData.email || 'fashionandmore.md@gmail.com', 
                                phone: brandData.phone || '+91 80729 77025', 
                                address: brandData.address || '49, Rayapuram West Street, Tirupur-641 604, Tamil Nadu.' 
                            },
                            social: socialLinks,
                            legal: legalInfo,
                            shopLinks: links
                                .filter(l => l.type === 'shop')
                                .map(l => ({
                                    label: l.label,
                                    href: l.href,
                                    active: !!l.active
                                })),
                            supportLinks: links
                                .filter(l => l.type === 'support')
                                .map(l => ({
                                    label: l.label,
                                    href: l.href,
                                    active: !!l.active
                                }))
                        },
                        genderCategory,
                        genderStatus
                    };
                    
                    console.log('Sending response successfully');
                    res.json(response);
                });
            });
        });
    });
};

exports.updateFooter = (req, res) => {
    console.log('Updating footer...');
    const { brandName, description, company, social, legal, shopLinks, supportLinks } = req.body;
    
    // Update site settings
    db.query(`
        INSERT INTO site_settings (id, brand_name, description, email, phone, address, social_links, legal_info)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        brand_name=VALUES(brand_name), 
        description=VALUES(description), 
        email=VALUES(email), 
        phone=VALUES(phone), 
        address=VALUES(address), 
        social_links=VALUES(social_links),
        legal_info=VALUES(legal_info)`,
        [
            brandName, 
            description, 
            company?.email, 
            company?.phone, 
            company?.address, 
            JSON.stringify(social || {}),
            JSON.stringify(legal || {})
        ],
        (err) => {
            if (err) {
                console.error('updateFooter error:', err);
                return res.status(500).json({ error: err.message });
            }
            
            // Delete old links
            db.query("DELETE FROM footer_links", (err) => {
                if (err) {
                    console.error('updateFooter error:', err);
                    return res.status(500).json({ error: err.message });
                }
                
                const allLinks = [
                    ...(shopLinks || []).map((l, idx) => ['shop', l.label, l.href || '#', l.active !== false, idx]),
                    ...(supportLinks || []).map((l, idx) => ['support', l.label, l.href || '#', l.active !== false, idx])
                ];
                
                if (allLinks.length > 0) {
                    db.query(
                        "INSERT INTO footer_links (type, label, href, active, display_order) VALUES ?", 
                        [allLinks],
                        (err) => {
                            if (err) {
                                console.error('updateFooter error:', err);
                                return res.status(500).json({ error: err.message });
                            }
                            console.log('Footer updated successfully');
                            res.json({ message: "Footer saved successfully" });
                        }
                    );
                } else {
                    console.log('Footer updated successfully');
                    res.json({ message: "Footer saved successfully" });
                }
            });
        }
    );
};

exports.updateGenderStatus = (req, res) => {
    console.log('Updating gender status...');
    const entries = Object.entries(req.body);
    let completed = 0;
    let hasError = false;
    
    if (entries.length === 0) {
        return res.json({ message: "Gender visibility saved successfully" });
    }
    
    entries.forEach(([name, status]) => {
        db.query(
            "UPDATE genders SET is_active = ? WHERE name = ?", 
            [status, name],
            (err) => {
                if (err && !hasError) {
                    hasError = true;
                    console.error('updateGenderStatus error:', err);
                    return res.status(500).json({ error: err.message });
                }
                
                completed++;
                if (completed === entries.length && !hasError) {
                    console.log('Gender status updated successfully');
                    res.json({ message: "Gender visibility saved successfully" });
                }
            }
        );
    });
};

exports.updateGenderCategory = (req, res) => {
    console.log('Updating gender categories...');
    const genders = Object.keys(req.body);
    let completed = 0;
    let hasError = false;
    
    if (genders.length === 0) {
        return res.json({ message: "Gender/Category mapping saved successfully" });
    }
    
    genders.forEach(gender => {
        // Insert gender if doesn't exist
        db.query(
            "INSERT INTO genders (name) VALUES (?) ON DUPLICATE KEY UPDATE name = name", 
            [gender],
            (err) => {
                if (err && !hasError) {
                    hasError = true;
                    console.error('updateGenderCategory error:', err);
                    return res.status(500).json({ error: err.message });
                }
                
                // Get existing categories for this gender
                db.query("SELECT name FROM categories WHERE gender_name = ?", [gender], (err, existingCats) => {
                    if (err && !hasError) {
                        hasError = true;
                        console.error('updateGenderCategory error:', err);
                        return res.status(500).json({ error: err.message });
                    }
                    
                    const existingCatNames = existingCats.map(c => c.name);
                    const newCatNames = req.body[gender];
                    
                    // Find categories to delete (only ones not in new list and not referenced by products)
                    const catsToDelete = existingCatNames.filter(name => !newCatNames.includes(name));
                    
                    // Find categories to add (only ones not already existing)
                    const catsToAdd = newCatNames.filter(name => !existingCatNames.includes(name));
                    
                    // Delete unused categories (that aren't referenced by products)
                    if (catsToDelete.length > 0) {
                        const placeholders = catsToDelete.map(() => '?').join(',');
                        db.query(
                            `DELETE FROM categories WHERE gender_name = ? AND name IN (${placeholders}) AND id NOT IN (SELECT DISTINCT category_id FROM products WHERE category_id IS NOT NULL)`,
                            [gender, ...catsToDelete],
                            (err) => {
                                if (err && !hasError) {
                                    hasError = true;
                                    console.error('updateGenderCategory error:', err);
                                    return res.status(500).json({ error: err.message });
                                }
                                
                                // Continue with adding new categories
                                addNewCategories();
                            }
                        );
                    } else {
                        addNewCategories();
                    }
                    
                    function addNewCategories() {
                        if (catsToAdd.length > 0) {
                            const cats = catsToAdd.map(n => [
                                n, 
                                n.toLowerCase().replace(/ /g, '-'), 
                                gender
                            ]);
                            
                            db.query(
                                "INSERT INTO categories (name, slug, gender_name) VALUES ? ON DUPLICATE KEY UPDATE slug = VALUES(slug)", 
                                [cats],
                                (err) => {
                                    if (err && !hasError) {
                                        hasError = true;
                                        console.error('updateGenderCategory error:', err);
                                        return res.status(500).json({ error: err.message });
                                    }
                                    
                                    completed++;
                                    if (completed === genders.length && !hasError) {
                                        console.log('Gender categories updated successfully');
                                        res.json({ message: "Gender/Category mapping saved successfully" });
                                    }
                                }
                            );
                        } else {
                            completed++;
                            if (completed === genders.length && !hasError) {
                                console.log('Gender categories updated successfully');
                                res.json({ message: "Gender/Category mapping saved successfully" });
                            }
                        }
                    }
                });
            }
        );
    });
};

// New endpoint to fetch genders and categories for admin forms
exports.getGendersAndCategories = (req, res) => {
    console.log('Fetching genders and categories...');
    
    db.query("SELECT * FROM genders WHERE is_active = 1 ORDER BY display_order", (err, genders) => {
        if (err) {
            console.error('getGendersAndCategories error:', err);
            return res.status(500).json({ error: err.message });
        }
        
        db.query("SELECT * FROM categories ORDER BY name", (err, categories) => {
            if (err) {
                console.error('getGendersAndCategories error:', err);
                return res.status(500).json({ error: err.message });
            }
            
            db.query("SELECT brand_name FROM site_settings WHERE id = 1", (err, settings) => {
                if (err) {
                    console.error('getGendersAndCategories error:', err);
                    return res.status(500).json({ error: err.message });
                }
                
                // Group categories by gender
                const genderCategoryMap = {};
                genders.forEach(g => {
                    genderCategoryMap[g.name] = categories
                        .filter(c => c.gender_name === g.name)
                        .map(c => ({ name: c.name, slug: c.slug }));
                });
                
                const response = {
                    genders: genders.map(g => g.name),
                    genderCategoryMap,
                    brandName: settings[0]?.brand_name || 'Humming Tone'
                };
                
                console.log('Sending genders and categories successfully');
                res.json(response);
            });
        });
    });
};