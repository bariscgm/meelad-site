import Team from '../models/Team.js';
import Program from '../models/Program.js';
import Result from '../models/Result.js';
import Candidate from '../models/Candidate.js';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
export const getAdminDashboard = async (req, res) => {
  try {
    const totalTeams = await Team.countDocuments();
    const totalPrograms = await Program.countDocuments();
    const totalStudents = await Candidate.countDocuments();
    const totalBoys = await Candidate.countDocuments({ gender: { $in: ['Boy', 'Male'] } });
    const totalGirls = await Candidate.countDocuments({ gender: { $in: ['Girl', 'Female'] } });
    
    const submittedResultsCount = await Result.countDocuments();
    const publishedResultsCount = await Result.countDocuments({ status: 'Published' });

    // Aggregate Top Teams from Results
    // Only published results count towards top team leaderboard
    const allPublishedResults = await Result.find({ status: 'Published' })
      .populate('winners.team')
      .populate('program');
    
    const teamPoints = {};

    allPublishedResults.forEach(result => {
      result.winners.forEach(winner => {
        if (winner.team && winner.team._id) {
          const teamId = winner.team._id.toString();
          if (!teamPoints[teamId]) {
            teamPoints[teamId] = {
              team: winner.team,
              totalPoints: 0
            };
          }
          teamPoints[teamId].totalPoints += (winner.points || 0);
        }
      });
    });

    const leaderboard = Object.values(teamPoints)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 3) // Get top 3 teams
      .map((item, index) => ({
        rank: index === 0 ? '1st' : index === 1 ? '2nd' : '3rd',
        name: item.team.name,
        code: item.team.code,
        points: `${item.totalPoints} pts`,
        color: index === 0 
          ? 'bg-teal-50 text-teal-700 border-teal-200' 
          : index === 1 
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-purple-50 text-purple-700 border-purple-200'
      }));

    // Recent System Activity
    // Fetch last 3 published results and last 2 programs created
    const recentResults = await Result.find({ status: 'Published' })
      .sort({ updatedAt: -1 })
      .limit(3)
      .populate('program');

    const recentPrograms = await Program.find()
      .sort({ createdAt: -1 })
      .limit(2);

    const activityLog = [];

    recentResults.forEach(r => {
      activityLog.push({
        type: 'result',
        message: `Result published: ${r.program ? r.program.name : 'Unknown'} (${r.program ? r.program.category : ''})`,
        time: r.updatedAt,
        colorClass: 'bg-emerald-50 border-emerald-100 text-emerald-800',
        timeClass: 'text-emerald-600'
      });
    });

    recentPrograms.forEach(p => {
      activityLog.push({
        type: 'program',
        message: `New program added: ${p.name}`,
        time: p.createdAt,
        colorClass: 'bg-blue-50 border-blue-100 text-blue-800',
        timeClass: 'text-blue-600'
      });
    });

    // Sort combined activity by time descending
    activityLog.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Fetch all candidates to map chestNo to category
    const candidates = await Candidate.find({}, 'chestNo category').lean();
    const chestNoToCategory = {};
    candidates.forEach(c => {
      if (c.chestNo) {
        chestNoToCategory[c.chestNo] = c.category ? c.category.toUpperCase() : 'UNKNOWN';
      }
    });

    // Aggregate Top Students from Results
    const studentPoints = {};

    allPublishedResults.forEach(result => {
      // Only count individual programs for student leaderboard
      if (result.program && result.program.type === 'Individual') {
        result.winners.forEach(winner => {
          if (winner.chestNo && winner.name) {
            const key = winner.chestNo;
            if (!studentPoints[key]) {
              studentPoints[key] = {
                name: winner.name,
                chestNo: winner.chestNo,
                category: chestNoToCategory[key] || 'UNKNOWN',
                totalPoints: 0
              };
            }
            studentPoints[key].totalPoints += (winner.points || 0);
          }
        });
      }
    });

    const topStudents = Object.values(studentPoints)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((item, index) => ({
        rank: index + 1, // Global rank, frontend will recalculate rank for filtered views
        name: item.name,
        chestNo: item.chestNo,
        category: item.category,
        points: item.totalPoints
      }));

    res.json({
      stats: {
        totalStudents,
        totalBoys,
        totalGirls,
        totalTeams,
        totalPrograms,
        submittedResults: submittedResultsCount,
        publishedResults: publishedResultsCount
      },
      topTeams: leaderboard,
      topStudents: topStudents,
      recentActivity: activityLog.slice(0, 4) // Return 4 most recent events
    });

  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};
