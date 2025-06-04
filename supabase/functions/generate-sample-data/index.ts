
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting sample data generation...');

    // Scenarios data
    const scenarios = [
      // Sales scenarios
      {
        title: "Llamada en Frío - Ventas B2B",
        description: "Practica técnicas de prospección para contactar empresas que no conocen tu producto",
        scenario_type: "sales",
        difficulty_level: 1,
        prompt_instructions: "Actúa como un tomador de decisiones en una empresa mediana. Sé escéptico pero profesional. Evalúa si la propuesta puede beneficiar a tu empresa.",
        expected_outcomes: {
          objectives: ["Captar atención en primeros 30 segundos", "Identificar pain points del cliente", "Agendar una demo o reunión"]
        }
      },
      {
        title: "Manejo de Objeciones de Precio",
        description: "Aprende a manejar objeciones relacionadas con el costo del producto o servicio",
        scenario_type: "sales",
        difficulty_level: 2,
        prompt_instructions: "Presenta objeciones de precio de manera realista. Menciona que el presupuesto es limitado y compara con competidores más baratos.",
        expected_outcomes: {
          objectives: ["Entender el valor percibido", "Justificar el ROI", "Ofrecer opciones de pricing"]
        }
      },
      {
        title: "Cierre de Venta Complejo",
        description: "Practica técnicas de cierre en ventas de alto valor con múltiples stakeholders",
        scenario_type: "sales",
        difficulty_level: 3,
        prompt_instructions: "Simula ser parte de un comité de compras. Haz preguntas técnicas y comerciales. Requiere aprobación de otros antes de decidir.",
        expected_outcomes: {
          objectives: ["Identificar todos los stakeholders", "Manejar múltiples objeciones", "Cerrar con próximos pasos claros"]
        }
      },
      // Customer Service scenarios
      {
        title: "Cliente Molesto - Producto Defectuoso",
        description: "Maneja la frustración de un cliente con un producto que no funciona correctamente",
        scenario_type: "customer_service",
        difficulty_level: 2,
        prompt_instructions: "Actúa como un cliente muy molesto. Tu producto se dañó después de una semana de uso. Exige reembolso inmediato y habla de manera emocional.",
        expected_outcomes: {
          objectives: ["Calmar al cliente", "Entender el problema específico", "Ofrecer solución satisfactoria"]
        }
      },
      {
        title: "Reclamo por Facturación",
        description: "Resuelve problemas relacionados con cobros incorrectos o facturación duplicada",
        scenario_type: "customer_service",
        difficulty_level: 1,
        prompt_instructions: "Te cobraron de más en tu última factura. Solicita explicación detallada y corrección inmediata.",
        expected_outcomes: {
          objectives: ["Revisar detalles de facturación", "Explicar cargos", "Procesar ajustes necesarios"]
        }
      },
      // Education scenarios
      {
        title: "Presentación de Proyecto Final",
        description: "Practica presentaciones académicas con Q&A del público",
        scenario_type: "education",
        difficulty_level: 2,
        prompt_instructions: "Actúa como un profesor y estudiantes. Haz preguntas desafiantes sobre metodología, resultados y conclusiones.",
        expected_outcomes: {
          objectives: ["Presentar con claridad", "Defender argumentos", "Responder preguntas técnicas"]
        }
      },
      {
        title: "Explicación de Concepto Complejo",
        description: "Enseña conceptos difíciles de manera simple y comprensible",
        scenario_type: "education",
        difficulty_level: 2,
        prompt_instructions: "Simula ser un estudiante que no entiende el tema. Haz preguntas básicas y pide ejemplos prácticos.",
        expected_outcomes: {
          objectives: ["Usar analogías efectivas", "Verificar comprensión", "Adaptar explicación al nivel"]
        }
      },
      // Recruitment scenarios
      {
        title: "Entrevista Técnica - Desarrollador",
        description: "Simula entrevistas técnicas para posiciones de desarrollo de software",
        scenario_type: "recruitment",
        difficulty_level: 3,
        prompt_instructions: "Actúa como un reclutador técnico. Evalúa conocimientos de programación, arquitectura y resolución de problemas.",
        expected_outcomes: {
          objectives: ["Demostrar conocimientos técnicos", "Explicar procesos de trabajo", "Mostrar capacidad de aprendizaje"]
        }
      },
      {
        title: "Entrevista Conductual - Liderazgo",
        description: "Evalúa competencias de liderazgo y trabajo en equipo",
        scenario_type: "recruitment",
        difficulty_level: 2,
        prompt_instructions: "Haz preguntas situacionales sobre liderazgo, conflictos en equipos y toma de decisiones difíciles.",
        expected_outcomes: {
          objectives: ["Dar ejemplos específicos", "Mostrar impacto de acciones", "Demostrar aprendizaje de errores"]
        }
      },
      // Negotiation scenarios
      {
        title: "Negociación Salarial",
        description: "Practica negociaciones de salario y beneficios laborales",
        scenario_type: "negotiation",
        difficulty_level: 2,
        prompt_instructions: "Actúa como un gerente de RRHH. Tienes un presupuesto limitado pero quieres retener al talento. Sé firme pero justo.",
        expected_outcomes: {
          objectives: ["Justificar valor aportado", "Proponer alternativas", "Llegar a acuerdo win-win"]
        }
      }
    ];

    // Knowledge base data
    const knowledgeBase = [
      {
        title: "Técnicas de Prospección en Ventas B2B",
        content: "La prospección efectiva en B2B requiere investigación previa, personalización del mensaje y múltiples touchpoints. Incluye técnicas como Social Selling, Cold Calling estructurado, y Email Sequences. Es fundamental identificar el timing correcto y el decision maker adecuado.",
        document_type: "guide",
        tags: ["sales", "prospecting", "b2b"]
      },
      {
        title: "Manejo de Objeciones: Framework HEARD",
        content: "H-Halt (pausar y escuchar), E-Empathize (empatizar), A-Ask (preguntar para clarificar), R-Respond (responder con solución), D-Decide (decidir próximos pasos). Este framework permite manejar objeciones de manera estructurada y efectiva.",
        document_type: "methodology",
        tags: ["sales", "objections", "framework"]
      },
      {
        title: "Servicio al Cliente: Método DESC",
        content: "D-Describe la situación, E-Express como te hace sentir, S-Specify lo que necesitas, C-Consequences positivas del cambio. Útil para manejar conflictos y quejas de manera constructiva.",
        document_type: "methodology",
        tags: ["customer_service", "conflict_resolution"]
      },
      {
        title: "Presentaciones Efectivas: Estructura STAR",
        content: "S-Situation (contexto), T-Task (tarea/objetivo), A-Action (acciones tomadas), R-Result (resultados obtenidos). Ideal para presentaciones de casos de estudio y entrevistas conductuales.",
        document_type: "template",
        tags: ["education", "presentations", "interviews"]
      },
      {
        title: "Técnicas de Escucha Activa",
        content: "Incluye parafrasear, hacer preguntas abiertas, resumir puntos clave, mostrar lenguaje corporal receptivo y evitar interrumpir. Fundamental en todas las interacciones profesionales.",
        document_type: "skills",
        tags: ["communication", "listening", "general"]
      },
      {
        title: "Negociación: Principios de Harvard",
        content: "1) Separar personas del problema, 2) Enfocarse en intereses no en posiciones, 3) Generar opciones de mutuo beneficio, 4) Usar criterios objetivos. Metodología probada para negociaciones exitosas.",
        document_type: "methodology",
        tags: ["negotiation", "harvard", "win-win"]
      },
      {
        title: "Preguntas SPIN en Ventas",
        content: "S-Situation (situación actual), P-Problem (problemas identificados), I-Implication (implicaciones del problema), N-Need-payoff (beneficios de la solución). Técnica para identificar necesidades del cliente.",
        document_type: "methodology",
        tags: ["sales", "questioning", "spin"]
      },
      {
        title: "Gestión de Crisis en Atención al Cliente",
        content: "1) Mantener la calma, 2) Escuchar sin interrumpir, 3) Reconocer emociones, 4) Disculparse por la situación, 5) Enfocarse en soluciones, 6) Hacer seguimiento. Protocolo para situaciones críticas.",
        document_type: "protocol",
        tags: ["customer_service", "crisis", "protocol"]
      },
      {
        title: "Entrevistas por Competencias: Método SOAR",
        content: "S-Situation (situación), O-Objective (objetivo), A-Action (acción), R-Result (resultado). Similar a STAR pero enfocado en el objetivo específico que se buscaba alcanzar.",
        document_type: "methodology",
        tags: ["recruitment", "interviews", "competencies"]
      },
      {
        title: "Comunicación Asertiva: Técnica del Disco Rayado",
        content: "Repetir el mensaje principal de manera calmada y consistente sin dejarse desviar por argumentos tangenciales. Útil para mantener límites y comunicar decisiones difíciles.",
        document_type: "technique",
        tags: ["communication", "assertiveness", "boundaries"]
      }
    ];

    // Behaviors data
    const behaviors = [
      {
        name: "Cliente Escéptico - Ventas Software",
        client_personality: "Soy un CTO muy analítico y escéptico. He tenido malas experiencias con proveedores anteriores. Necesito evidencia concreta del ROI y casos de éxito similares. Pregunto mucho sobre seguridad, escalabilidad y soporte técnico.",
        emotional_tone: "skeptical",
        technical_level: "expert",
        common_objections: ["Es muy caro comparado con la competencia", "¿Cómo sabemos que es seguro?", "Nuestro equipo técnico ya está saturado", "¿Qué pasa si ustedes cierran como empresa?"],
        knowledge_base: "Conocimiento profundo en tecnología, arquitectura de sistemas, ciberseguridad. Experiencia con implementaciones fallidas. Presupuesto limitado pero con autoridad de decisión.",
        response_style: "Directo, técnico, hace preguntas específicas. Interrumpe si algo no le convence. Pide referencias y casos de uso específicos.",
        voice: "George"
      },
      {
        name: "Cliente Molesto - Servicio al Cliente",
        client_personality: "Estoy muy frustrado porque mi producto se dañó después de solo una semana de uso. He llamado tres veces y nadie me ha dado una solución clara. Necesito que esto se resuelva HOY porque lo necesito para trabajar.",
        emotional_tone: "angry",
        technical_level: "beginner",
        common_objections: ["Esto es inaceptable", "Quiero hablar con un supervisor", "Exijo reembolso completo", "Voy a dejar reseñas negativas"],
        knowledge_base: "Usuario básico del producto. No entiende términos técnicos. Presión de tiempo por trabajo. Experiencia negativa previa.",
        response_style: "Emocional, interrumpe, eleva el tono de voz. Se calma si siente que lo entienden y le ofrecen soluciones concretas.",
        voice: "Charlotte"
      },
      {
        name: "Estudiante Confundido - Matemáticas",
        client_personality: "Soy estudiante de preparatoria y las matemáticas no son mi fuerte. Me cuesta trabajo entender conceptos abstractos y necesito muchos ejemplos prácticos. Me da pena preguntar pero realmente quiero aprender.",
        emotional_tone: "curious",
        technical_level: "beginner",
        common_objections: ["No entiendo para qué sirve esto en la vida real", "¿Hay una forma más fácil de hacer esto?", "Me confundo con tantas fórmulas"],
        knowledge_base: "Nivel básico en matemáticas. Aprende mejor con ejemplos visuales. Motivado pero inseguro.",
        response_style: "Tímido al principio, hace preguntas básicas. Se anima cuando entiende. Pide que repitan explicaciones.",
        voice: "Alice"
      },
      {
        name: "Candidato Nervioso - Entrevista",
        client_personality: "Es mi primera entrevista para un trabajo importante. Estoy muy nervioso pero preparado. Tengo las habilidades pero me cuesta expresarme bajo presión. Quiero demostrar mi potencial.",
        emotional_tone: "nervous",
        technical_level: "intermediate",
        common_objections: ["No tengo experiencia en esa área específica", "Soy perfeccionista, a veces tardo mucho", "No he trabajado en equipos tan grandes"],
        knowledge_base: "Buena preparación académica. Proyectos personales. Poca experiencia laboral formal. Muchas ganas de aprender.",
        response_style: "Habla rápido cuando está nervioso. Da respuestas largas. Se relaja con preguntas abiertas.",
        voice: "Sarah"
      },
      {
        name: "Gerente Ocupado - Prospección",
        client_personality: "Soy gerente general de una empresa en crecimiento. Mi tiempo es muy valioso y recibo muchas llamadas de ventas. Solo me interesa si realmente puede impactar mi negocio. Soy directo y voy al grano.",
        emotional_tone: "busy",
        technical_level: "intermediate",
        common_objections: ["No tengo tiempo para esto", "Ya tenemos un proveedor", "Envíame información por email", "¿Cuánto cuesta realmente?"],
        knowledge_base: "Enfocado en resultados y ROI. Conoce su industria. Toma decisiones rápidas. Delega implementación.",
        response_style: "Interrumpe si no ve valor inmediato. Hace preguntas directas sobre costos y beneficios. Aprecia brevedad.",
        voice: "Brian"
      },
      {
        name: "Cliente Indeciso - Compra Grande",
        client_personality: "Necesito hacer una compra importante para mi empresa pero tengo miedo de equivocarme. Comparo muchas opciones y pido opiniones de mi equipo. Necesito sentirme seguro antes de decidir.",
        emotional_tone: "concerned",
        technical_level: "intermediate",
        common_objections: ["¿Y si hay algo mejor en el mercado?", "¿Qué pasa si no funciona para nosotros?", "Mi equipo prefiere otra opción", "¿Puedo probarlo antes?"],
        knowledge_base: "Investigador meticuloso. Busca validación externa. Presión por tomar la decisión correcta.",
        response_style: "Hace muchas preguntas. Pide tiempo para consultar. Busca garantías y referencias.",
        voice: "Jessica"
      },
      {
        name: "Profesor Exigente - Presentación",
        client_personality: "Soy profesor universitario con altos estándares. Evalúo tanto el contenido como la presentación. Hago preguntas desafiantes para probar el conocimiento profundo del tema. Busco pensamiento crítico.",
        emotional_tone: "serious",
        technical_level: "expert",
        common_objections: ["La metodología no es rigurosa", "Falta evidencia empírica", "¿Has considerado variables alternativas?", "Esa conclusión parece prematura"],
        knowledge_base: "Experto académico. Conocimiento de metodologías de investigación. Estándares altos de evidencia.",
        response_style: "Formal, hace preguntas específicas y técnicas. Interrumpe para aclarar puntos. Aprecia rigor académico.",
        voice: "Daniel"
      },
      {
        name: "Startup Founder - Negociación",
        client_personality: "Soy fundador de una startup en crecimiento. Recursos limitados pero gran potencial. Busco partners que entiendan mi visión a largo plazo. Dispuesto a negociar términos creativos.",
        emotional_tone: "enthusiastic",
        technical_level: "advanced",
        common_objections: ["No tenemos presupuesto ahora", "¿Pueden crecer con nosotros?", "Necesitamos flexibilidad en los términos", "¿Qué pasa cuando escalemos 10x?"],
        knowledge_base: "Visionario, conoce su mercado. Limitaciones de cash flow. Piensa en escalabilidad.",
        response_style: "Energético, habla rápido sobre su visión. Busca partnerships estratégicos. Creativo en negociaciones.",
        voice: "Eric"
      },
      {
        name: "Cliente Senior - Soporte Técnico",
        client_personality: "Soy una persona mayor que no está muy cómoda con la tecnología. Necesito explicaciones paso a paso y mucha paciencia. Me frustro fácilmente pero aprecio cuando alguien me ayuda con cariño.",
        emotional_tone: "frustrated",
        technical_level: "beginner",
        common_objections: ["Esto es muy complicado", "En mis tiempos era más simple", "¿No hay una forma más fácil?", "Mi nieto lo hace diferente"],
        knowledge_base: "Conocimiento tecnológico muy básico. Aprende lento pero seguro. Valora la paciencia y respeto.",
        response_style: "Habla despacio, necesita confirmación frecuente. Se disculpa por no entender. Agradece mucho la ayuda.",
        voice: "Charlotte"
      },
      {
        name: "Ejecutivo Experimentado - Coaching",
        client_personality: "Soy ejecutivo senior con 20 años de experiencia. Conozco muchas metodologías pero busco perspectivas frescas. Soy escéptico de teorías sin aplicación práctica. Valoro la experiencia real.",
        emotional_tone: "analytical",
        technical_level: "expert",
        common_objections: ["Ya he probado eso antes", "¿Tienes casos de empresas similares?", "La teoría es buena pero la práctica es diferente", "¿Cómo medimos el impacto real?"],
        knowledge_base: "Amplia experiencia ejecutiva. Conoce múltiples industrias. Enfocado en resultados medibles.",
        response_style: "Profesional, comparte experiencias propias. Cuestiona con base en experiencia. Busca aplicación práctica.",
        voice: "Will"
      }
    ];

    // Challenges data
    const challenges = [
      {
        title: "Maestro de la Primera Impresión",
        description: "Completa 10 llamadas en frío con apertura exitosa en los primeros 30 segundos",
        challenge_type: "individual",
        difficulty_level: 1,
        target_score: 800,
        objective_type: "score",
        objective_value: 10,
        reward_xp: 100
      },
      {
        title: "Domador de Objeciones",
        description: "Maneja exitosamente 15 objeciones diferentes usando técnicas apropiadas",
        challenge_type: "individual",
        difficulty_level: 2,
        target_score: 1200,
        objective_type: "score",
        objective_value: 15,
        reward_xp: 150
      },
      {
        title: "Cerrador Profesional",
        description: "Cierra 5 ventas complejas con puntuación superior a 85",
        challenge_type: "individual",
        difficulty_level: 3,
        target_score: 425,
        objective_type: "score",
        objective_value: 5,
        reward_xp: 200
      },
      {
        title: "Pacificador de Clientes",
        description: "Calma exitosamente a 8 clientes molestos y resuelve sus problemas",
        challenge_type: "individual",
        difficulty_level: 2,
        target_score: 640,
        objective_type: "score",
        objective_value: 8,
        reward_xp: 120
      },
      {
        title: "Presentador Estrella",
        description: "Realiza 6 presentaciones académicas con Q&A exitoso",
        challenge_type: "individual",
        difficulty_level: 2,
        target_score: 480,
        objective_type: "score",
        objective_value: 6,
        reward_xp: 100
      },
      {
        title: "Reclutador Experto",
        description: "Conduce 12 entrevistas de selección con evaluación completa",
        challenge_type: "individual",
        difficulty_level: 2,
        target_score: 960,
        objective_type: "score",
        objective_value: 12,
        reward_xp: 130
      },
      {
        title: "Negociador Estratégico",
        description: "Completa 4 negociaciones complejas con resultado win-win",
        challenge_type: "individual",
        difficulty_level: 3,
        target_score: 340,
        objective_type: "score",
        objective_value: 4,
        reward_xp: 180
      },
      {
        title: "Comunicador 360",
        description: "Domina 20 sesiones en diferentes categorías con puntuación promedio de 80+",
        challenge_type: "individual",
        difficulty_level: 3,
        target_score: 1600,
        objective_type: "score",
        objective_value: 20,
        reward_xp: 250
      },
      {
        title: "Equipo de Ventas Élite",
        description: "Equipo debe completar 50 sesiones de ventas con promedio de 85+",
        challenge_type: "team",
        difficulty_level: 3,
        target_score: 4250,
        objective_type: "team_score",
        objective_value: 50,
        reward_xp: 300
      },
      {
        title: "Academia de Servicio",
        description: "Equipo de soporte debe resolver 30 casos de clientes molestos exitosamente",
        challenge_type: "team",
        difficulty_level: 2,
        target_score: 2400,
        objective_type: "team_score",
        objective_value: 30,
        reward_xp: 200
      }
    ];

    console.log('Inserting scenarios...');
    for (const scenario of scenarios) {
      const { error } = await supabase
        .from('scenarios')
        .upsert(scenario, { onConflict: 'title' });
      
      if (error) console.error('Error inserting scenario:', error);
    }

    console.log('Inserting knowledge base...');
    for (const kb of knowledgeBase) {
      const { error } = await supabase
        .from('knowledge_base')
        .upsert(kb, { onConflict: 'title' });
      
      if (error) console.error('Error inserting knowledge base:', error);
    }

    console.log('Inserting behaviors...');
    // Get scenarios to reference in behaviors
    const { data: scenariosData } = await supabase
      .from('scenarios')
      .select('id, title');

    for (const behavior of behaviors) {
      // Find matching scenario
      const matchingScenario = scenariosData?.find(s => 
        s.title.toLowerCase().includes(behavior.name.toLowerCase().split(' - ')[1]?.toLowerCase() || '')
      );

      const behaviorWithScenario = {
        ...behavior,
        scenario_id: matchingScenario?.id || null,
        is_active: true
      };

      const { error } = await supabase
        .from('behaviors')
        .upsert(behaviorWithScenario, { onConflict: 'name' });
      
      if (error) console.error('Error inserting behavior:', error);
    }

    console.log('Inserting challenges...');
    for (const challenge of challenges) {
      const challengeWithDates = {
        ...challenge,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        is_active: true,
        is_custom: false
      };

      const { error } = await supabase
        .from('challenges')
        .upsert(challengeWithDates, { onConflict: 'title' });
      
      if (error) console.error('Error inserting challenge:', error);
    }

    console.log('Sample data generation completed successfully!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Sample data generated successfully',
        counts: {
          scenarios: scenarios.length,
          knowledgeBase: knowledgeBase.length,
          behaviors: behaviors.length,
          challenges: challenges.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating sample data:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate sample data', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
