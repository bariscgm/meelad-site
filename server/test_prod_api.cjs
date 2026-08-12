const https = require('https');

https.get('https://meelad-site.onrender.com/api/programs', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const programs = JSON.parse(data);
      const generalPrograms = programs.filter(p => p.category === 'GENERAL' || p.category === 'General');
      console.log(`Found ${generalPrograms.length} General programs.`);
      
      if (generalPrograms.length > 0) {
        const p = generalPrograms[0];
        console.log(`Testing program: ${p.name} (ID: ${p._id})`);
        
        https.get(`https://meelad-site.onrender.com/api/programs/${p._id}/candidates`, (res2) => {
          let data2 = '';
          res2.on('data', chunk => data2 += chunk);
          res2.on('end', () => {
            const candidates = JSON.parse(data2);
            console.log(`Candidates returned: ${candidates.length}`);
            if (candidates.length > 0) {
                console.log(`First candidate: ${candidates[0].name}`);
            }
          });
        });
      }
    } catch (e) {
      console.error(e);
    }
  });
}).on('error', (e) => {
  console.error(e);
});
