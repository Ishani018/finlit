const fs = require('fs');

let content = fs.readFileSync('src/screens/FamilyScreen.js', 'utf8');

// Add GRAVESTONE_IMG at top
if (!content.includes('GRAVESTONE_IMG')) {
    content = content.replace(
        /const BANQUET_IMG = require\('\.\.\/\.\.\/assets\/ui_comp\/banquet_hall\.png'\);/,
        `const BANQUET_IMG = require('../../assets/ui_comp/banquet_hall.png');\nconst GRAVESTONE_IMG = require('../../assets/ui_comp/gravestone.png');`
    );
}

// ChildCard
content = content.replace(
    /function ChildCard\(\{ child, onPress \}\) \{[\s\S]*?const stage = getChildStage\(child\.childAgeMonths \|\| 0\);[\s\S]*?const img   = getChildImage\(child\.gender, child\.childAgeMonths \|\| 0\);/,
    `function ChildCard({ child, onPress }) {
    const isDead = child.isDead;
    const stage = isDead ? { label: 'DECEASED', color: '#666', cost: '₹0/mo' } : getChildStage(child.childAgeMonths || 0);
    const ageYr = Math.floor((child.childAgeMonths || 0) / 12);
    const img   = isDead ? GRAVESTONE_IMG : getChildImage(child.gender, child.childAgeMonths || 0);`
);

// ChildCard HP rendering
content = content.replace(
    /<View style=\{\{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 \}\}>[\s\S]*?<Text style=\{\{ fontFamily: 'VT323_400Regular', fontSize: 14, color: hpColor\(hp\) \}\}>\{Math\.round\(hp\)\}HP<\/Text>[\s\S]*?<\/View>[\s\S]*?<View style=\{\{ height: 4, backgroundColor: C\.bg, marginTop: 7 \}\}>[\s\S]*?<View style=\{\{ height: '100%', width: \`\$\{hp\}%\`, backgroundColor: hpColor\(hp\) \}\} \/>[\s\S]*?<\/View>/,
    `<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                    <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 15, color: isEx ? C.gold : stage.color }}>
                        {isDead ? 'Rest in Peace' : (isEx ? '₹10,000/mo' : stage.cost)}
                    </Text>
                    {!isDead && <Text style={{ fontFamily: 'VT323_400Regular', fontSize: 14, color: hpColor(hp) }}>{Math.round(hp)}HP</Text>}
                </View>
                {!isDead && (
                    <View style={{ height: 4, backgroundColor: C.bg, marginTop: 7 }}>
                        <View style={{ height: '100%', width: \`\${hp}%\`, backgroundColor: hpColor(hp) }} />
                    </View>
                )}`
);

// Parents logic (inside render rows)
// We need to replace the parent PersonCard rendering
const parentRegex = /<PersonCard[\s\S]*?image=\{left\.data\.parentType === 'mother' \? DEP_IMAGES\.elderly_mother : left\.data\.parentType === 'father' \? DEP_IMAGES\.elderly_father : DEP_IMAGES\.elderly_couple\}[\s\S]*?contain[\s\S]*?name=\{left\.data\.name\}[\s\S]*?tag=\{left\.data\.parentType === 'mother' \? 'MOTHER' : left\.data\.parentType === 'father' \? 'FATHER' : 'PARENT'\}[\s\S]*?color=\{C\.gold\}[\s\S]*?sub1="Under your care"[\s\S]*?sub2="₹15,000\/mo"[\s\S]*?hp=\{left\.data\.health\}[\s\S]*?onPress=\{\(\) => setSelectedDep\(left\.data\)\}[\s\S]*?\/>/;

const parentReplacement = `<PersonCard
                                        image={left.data.isDead ? GRAVESTONE_IMG : (left.data.parentType === 'mother' ? DEP_IMAGES.elderly_mother : left.data.parentType === 'father' ? DEP_IMAGES.elderly_father : DEP_IMAGES.elderly_couple)}
                                        contain
                                        name={left.data.name}
                                        tag={left.data.isDead ? 'DECEASED' : (left.data.parentType === 'mother' ? 'MOTHER' : left.data.parentType === 'father' ? 'FATHER' : 'PARENT')}
                                        color={left.data.isDead ? '#666' : C.gold}
                                        sub1={left.data.isDead ? 'Rest in Peace' : "Under your care"}
                                        sub2={left.data.isDead ? '' : "₹15,000/mo"}
                                        hp={left.data.isDead ? undefined : left.data.health}
                                        onPress={() => setSelectedDep(left.data)}
                                    />`;

content = content.replace(parentRegex, parentReplacement);

fs.writeFileSync('src/screens/FamilyScreen.js', content, 'utf8');
