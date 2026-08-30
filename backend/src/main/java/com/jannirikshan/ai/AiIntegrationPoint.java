package com.jannirikshan.ai;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks rule-based / manual prototype services that serve as future AI/ML integration boundaries.
 * Current implementation provides deterministic, explainable algorithms without external AI dependencies.
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface AiIntegrationPoint {
    String feature();
    String futureTechnology() default "LLM / Vision / Embeddings / Deep Learning";
    String currentFallback() default "Rule-based heuristic & manual override";
}
