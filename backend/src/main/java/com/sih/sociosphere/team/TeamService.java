package com.sih.sociosphere.team;

import com.sih.sociosphere.project.Project;
import com.sih.sociosphere.project.ProjectRepository;
import com.sih.sociosphere.student.Student;
import com.sih.sociosphere.student.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRepository projectRepository;
    private final StudentRepository studentRepository;

    public TeamService(
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            ProjectRepository projectRepository,
            StudentRepository studentRepository
    ) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.projectRepository = projectRepository;
        this.studentRepository = studentRepository;
    }

    public List<Team> getTeamsForProject(Long projectId) {
        return teamRepository.findByProjectId(projectId);
    }

    public List<TeamMember> getMembers(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId);
    }

    @Transactional
    public Team createTeam(Long projectId, String teamName, Long leaderStudentId) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
        Student leader = leaderStudentId != null ? studentRepository.findById(leaderStudentId).orElse(null) : null;

        Team team = new Team();
        team.setProject(project);
        team.setName(teamName != null ? teamName : "Team " + project.getTitle());
        team.setLeader(leader);
        team.setTotalMembers(leader != null ? 1 : 0);

        Team saved = teamRepository.save(team);

        if (leader != null) {
            TeamMember tm = new TeamMember();
            tm.setTeam(saved);
            tm.setStudent(leader);
            tm.setRoleInTeam("Team Lead");
            tm.setStatus("ACTIVE");
            teamMemberRepository.save(tm);
        }

        return saved;
    }

    @Transactional
    public TeamMember addMember(Long teamId, Long studentId, String roleInTeam) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new IllegalArgumentException("Team not found: " + teamId));
        Student student = studentRepository.findById(studentId).orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));

        TeamMember tm = new TeamMember();
        tm.setTeam(team);
        tm.setStudent(student);
        tm.setRoleInTeam(roleInTeam != null ? roleInTeam : "Student Engineer");
        tm.setStatus("ACTIVE");

        team.setTotalMembers(team.getTotalMembers() + 1);
        teamRepository.save(team);

        return teamMemberRepository.save(tm);
    }
}
