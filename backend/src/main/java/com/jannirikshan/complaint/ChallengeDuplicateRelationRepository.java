package com.jannirikshan.complaint;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChallengeDuplicateRelationRepository extends JpaRepository<ChallengeDuplicateRelation, Long> {
    List<ChallengeDuplicateRelation> findByMasterChallengeId(Long masterChallengeId);
    List<ChallengeDuplicateRelation> findByDuplicateChallengeId(Long duplicateChallengeId);
}
