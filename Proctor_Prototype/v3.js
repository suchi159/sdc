const MOCK_API_DATA = {"/api/candidates":[{"id":"cand_001","rollNo":"CS2026-001","name":"John Smith","email":"john.smith@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1001","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"completed","learningProgress":100,"lastActive":"2026-06-17T10:38:10.346Z","currentQuestion":28,"totalQuestions":40,"timeRemaining":2400,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","examScore":0,"candidateId":"SDC-CAN-6001","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":true,"note":"Extra 30 minutes \u2014 documented learning disability."},"rules":{"examMode":"online","retakeAllowed":true,"retakeMode":"online","onlinePayer":"student"}},{"id":"cand_002","rollNo":"CS2026-002","name":"Emily Johnson","email":"emily.johnson@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1002","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:10:00Z","currentQuestion":32,"totalQuestions":40,"timeRemaining":1800,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6002","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_003","rollNo":"CS2026-003","name":"Michael Williams","email":"michael.williams@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1003","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:08:00Z","currentQuestion":15,"totalQuestions":40,"timeRemaining":3600,"warningCount":3,"aiRisk":"red","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6003","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_004","rollNo":"CS2026-004","name":"Sarah Brown","email":"sarah.brown@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1004","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:11:00Z","currentQuestion":35,"totalQuestions":40,"timeRemaining":900,"warningCount":2,"aiRisk":"amber","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6004","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_005","rollNo":"CS2026-005","name":"David Jones","email":"david.jones@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1005","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:09:00Z","currentQuestion":22,"totalQuestions":40,"timeRemaining":3000,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6005","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_006","rollNo":"FIN2026-001","name":"Jessica Garcia","email":"jessica.garcia@student.edu","subject":"Food Protection Manager","photo":"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1006","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:13:00Z","currentQuestion":38,"totalQuestions":40,"timeRemaining":600,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6001","examAssessment":"Food Protection Manager","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_007","rollNo":"FIN2026-002","name":"Matthew Miller","email":"matthew.miller@student.edu","subject":"Food Protection Manager","photo":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1007","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:05:00Z","currentQuestion":18,"totalQuestions":40,"timeRemaining":3300,"warningCount":4,"aiRisk":"red","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6002","examAssessment":"Food Protection Manager","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_008","rollNo":"CS2026-010","name":"Amanda Wilson","email":"amanda.wilson@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80","sessionId":"sess_001","voucherCode":"VCH-B2001","voucherStatus":"assigned","voucherAssignedAt":"2026-05-18T10:15:00Z","examStatus":"session_scheduled","learningProgress":85,"lastActive":"2026-05-20T18:00:00Z","currentQuestion":0,"totalQuestions":40,"timeRemaining":7200,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-18T10:00:00Z","candidateId":"SDC-CAN-6010","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_009","rollNo":"CS2026-011","name":"Joshua Moore","email":"joshua.moore@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&auto=format&fit=crop&q=80","sessionId":"sess_001","voucherCode":"VCH-B2002","voucherStatus":"assigned","voucherAssignedAt":"2026-05-18T10:15:00Z","examStatus":"session_scheduled","learningProgress":72,"lastActive":"2026-05-20T17:00:00Z","currentQuestion":0,"totalQuestions":40,"timeRemaining":7200,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-18T10:00:00Z","candidateId":"SDC-CAN-6011","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_010","rollNo":"DS2026-001","name":"Ashley Taylor","email":"ashley.taylor@student.edu","subject":"HACCP Certification","photo":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80","sessionId":"sess_003","voucherCode":null,"voucherStatus":"unassigned","voucherAssignedAt":null,"examStatus":"enrolled","learningProgress":45,"lastActive":"2026-05-20T14:00:00Z","currentQuestion":0,"totalQuestions":30,"timeRemaining":3600,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-20T16:00:00Z","candidateId":"SDC-CAN-6001","examAssessment":"HACCP Certification","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_011","rollNo":"ACC2026-001","name":"Andrew Anderson","email":"andrew.anderson@student.edu","subject":"Allergen Awareness","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_004","voucherCode":"VCH-C3001","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-13T09:00:00Z","examStatus":"completed","learningProgress":100,"lastActive":"2026-05-19T12:30:00Z","currentQuestion":40,"totalQuestions":40,"timeRemaining":0,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-12T09:00:00Z","examScore":88,"candidateId":"SDC-CAN-6001","examAssessment":"Allergen Awareness","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_012","rollNo":"ACC2026-002","name":"Jennifer Thomas","email":"jennifer.thomas@student.edu","subject":"Allergen Awareness","photo":"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&auto=format&fit=crop&q=80","sessionId":"sess_004","voucherCode":"VCH-C3002","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-13T09:00:00Z","examStatus":"completed","learningProgress":100,"lastActive":"2026-05-19T12:15:00Z","currentQuestion":40,"totalQuestions":40,"timeRemaining":0,"warningCount":1,"aiRisk":"green","enrolledAt":"2026-05-12T09:00:00Z","examScore":76,"candidateId":"SDC-CAN-6002","examAssessment":"Allergen Awareness","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_013","rollNo":"CS2026-113","name":"Robert Davis","email":"robert.davis@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1013","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:10:00Z","currentQuestion":30,"totalQuestions":40,"timeRemaining":3557,"warningCount":1,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6113","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_014","rollNo":"CS2026-114","name":"Linda Martinez","email":"linda.martinez@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1014","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:10:00Z","currentQuestion":20,"totalQuestions":40,"timeRemaining":950,"warningCount":2,"aiRisk":"amber","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6114","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_015","rollNo":"CS2026-115","name":"William Hernandez","email":"william.hernandez@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1015","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:10:00Z","currentQuestion":21,"totalQuestions":40,"timeRemaining":1040,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6115","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_016","rollNo":"CS2026-116","name":"Barbara Moore","email":"barbara.moore@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1016","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:10:00Z","currentQuestion":32,"totalQuestions":40,"timeRemaining":1819,"warningCount":1,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6116","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_017","rollNo":"CS2026-117","name":"Richard Jackson","email":"richard.jackson@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1017","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:10:00Z","currentQuestion":27,"totalQuestions":40,"timeRemaining":2321,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6117","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_018","rollNo":"CS2026-118","name":"Susan White","email":"susan.white@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1018","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:10:00Z","currentQuestion":27,"totalQuestions":40,"timeRemaining":3045,"warningCount":1,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6118","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_019","rollNo":"CS2026-119","name":"Joseph Harris","email":"joseph.harris@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1019","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:10:00Z","currentQuestion":13,"totalQuestions":40,"timeRemaining":1827,"warningCount":1,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6119","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_020","rollNo":"CS2026-120","name":"Margaret Clark","email":"margaret.clark@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1020","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:10:00Z","currentQuestion":31,"totalQuestions":40,"timeRemaining":2567,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6120","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_021","rollNo":"CS2026-121","name":"Thomas Lewis","email":"thomas.lewis@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1021","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:10:00Z","currentQuestion":24,"totalQuestions":40,"timeRemaining":1949,"warningCount":2,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6121","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_022","rollNo":"CS2026-122","name":"Betty Walker","email":"betty.walker@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1022","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:10:00Z","currentQuestion":11,"totalQuestions":40,"timeRemaining":1309,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6122","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_023","rollNo":"CS2026-123","name":"Charles Hall","email":"charles.hall@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1023","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:10:00Z","currentQuestion":8,"totalQuestions":40,"timeRemaining":1989,"warningCount":0,"aiRisk":"red","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6123","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_024","rollNo":"CS2026-124","name":"Lisa Allen","email":"lisa.allen@student.edu","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-A1024","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-05-21T14:10:00Z","currentQuestion":24,"totalQuestions":40,"timeRemaining":2007,"warningCount":0,"aiRisk":"amber","enrolledAt":"2026-05-15T08:30:00Z","candidateId":"SDC-CAN-6124","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_025","rollNo":"R-2026-0025","name":"Olivia Bennett","email":"olivia.bennett@sdc-exam.com","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-B2000","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"passed","learningProgress":100,"lastActive":"2026-06-17T10:38:10.346Z","currentQuestion":28,"totalQuestions":40,"timeRemaining":2400,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","examScore":0,"candidateId":"SDC-CAN-0025","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_026","rollNo":"R-2026-0026","name":"Liam Carter","email":"liam.carter@sdc-exam.com","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-B2001","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"failed","learningProgress":100,"lastActive":"2026-06-17T10:38:10.346Z","currentQuestion":28,"totalQuestions":40,"timeRemaining":2400,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","examScore":0,"candidateId":"SDC-CAN-0026","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_027","rollNo":"R-2026-0027","name":"Sophia Nguyen","email":"sophia.nguyen@sdc-exam.com","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-B2002","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"flagged","learningProgress":100,"lastActive":"2026-06-17T10:38:10.346Z","currentQuestion":28,"totalQuestions":40,"timeRemaining":2400,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","examScore":0,"candidateId":"SDC-CAN-0027","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_028","rollNo":"R-2026-0028","name":"Noah Patel","email":"noah.patel@sdc-exam.com","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-B2003","voucherStatus":"expired","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"no_show","learningProgress":40,"lastActive":"2026-06-17T10:38:10.346Z","currentQuestion":28,"totalQuestions":40,"timeRemaining":2400,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","examScore":0,"candidateId":"SDC-CAN-0028","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_029","rollNo":"R-2026-0029","name":"Emma Rodriguez","email":"emma.rodriguez@sdc-exam.com","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-B2004","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"pending_review","learningProgress":100,"lastActive":"2026-06-17T10:38:10.346Z","currentQuestion":28,"totalQuestions":40,"timeRemaining":2400,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","examScore":0,"candidateId":"SDC-CAN-0029","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_030","rollNo":"R-2026-0030","name":"Marcus Reed","email":"marcus.reed@sdc-exam.com","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-C3000","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":60,"lastActive":"2026-06-17T10:38:10.346Z","currentQuestion":28,"totalQuestions":40,"timeRemaining":2400,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","examScore":0,"candidateId":"SDC-CAN-0030","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_031","rollNo":"R-2026-0031","name":"Priya Anand","email":"priya.anand@sdc-exam.com","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-C3001","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":75,"lastActive":"2026-06-17T10:38:10.346Z","currentQuestion":28,"totalQuestions":40,"timeRemaining":2400,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","examScore":0,"candidateId":"SDC-CAN-0031","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_032","rollNo":"R-2026-0032","name":"Diego Santos","email":"diego.santos@sdc-exam.com","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-C3002","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":80,"lastActive":"2026-06-17T10:38:10.346Z","currentQuestion":28,"totalQuestions":40,"timeRemaining":2400,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","examScore":0,"candidateId":"SDC-CAN-0032","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_033","rollNo":"R-2026-0033","name":"Hannah Kim","email":"hannah.kim@sdc-exam.com","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-C3003","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":90,"lastActive":"2026-06-17T10:38:10.346Z","currentQuestion":28,"totalQuestions":40,"timeRemaining":2400,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","examScore":0,"candidateId":"SDC-CAN-0033","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_034","rollNo":"R-2026-0034","name":"Yusuf Demir","email":"yusuf.demir@sdc-exam.com","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-C3004","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":100,"lastActive":"2026-06-17T10:38:10.346Z","currentQuestion":28,"totalQuestions":40,"timeRemaining":2400,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","examScore":0,"candidateId":"SDC-CAN-0034","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}},{"id":"cand_035","rollNo":"R-2026-0035","name":"Grace Mueller","email":"grace.mueller@sdc-exam.com","subject":"ServSafe Food Handler","photo":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80","sessionId":"sess_002","voucherCode":"VCH-C3005","voucherStatus":"redeemed","voucherAssignedAt":"2026-05-16T10:00:00Z","examStatus":"in_progress","learningProgress":45,"lastActive":"2026-06-17T10:38:10.346Z","currentQuestion":28,"totalQuestions":40,"timeRemaining":2400,"warningCount":0,"aiRisk":"green","enrolledAt":"2026-05-15T08:30:00Z","examScore":0,"candidateId":"SDC-CAN-0035","examAssessment":"ServSafe Food Handler","accommodation":{"enabled":false,"note":""},"rules":{}}],"/api/sessions":[{"id":"sess_007","name":"Food Defense Mastery \u2014 Quarter 1","organization":"SafeFood AI","examDate":"2026-06-15T09:00:00Z","startTime":"09:00","duration":90,"status":"ongoing","allowRetake":true,"maxRetakeAttempts":2,"retakeWindow":7,"createdAt":"2026-05-25T10:00:00Z","createdBy":"usr_001","candidateCount":24,"vouchersAssigned":20,"vouchersUsed":0,"vouchersAvailable":4,"readiness":65,"activityLog":[{"ts":"2026-05-25T10:00:00Z","by":"Dr. Sarah Jenkins","action":"Created cohort","detail":"24 candidates enrolled"}],"allowOnline":true,"onlinePayer":"organization"},{"id":"sess_001","name":"ServSafe Food Handler \u2014 Mid-Semester Exam","organization":"SafeFood AI","examDate":"2026-05-22T09:00:00Z","startTime":"09:00","duration":120,"status":"live","allowRetake":true,"maxRetakeAttempts":2,"retakeWindow":7,"createdAt":"2026-05-18T10:00:00Z","createdBy":"usr_001","candidateCount":18,"vouchersAssigned":18,"vouchersUsed":0,"vouchersAvailable":7,"activityLog":[{"ts":"2026-05-18T10:00:00Z","by":"Dr. Sarah Jenkins","action":"Created cohort","detail":"Initial creation with 18 candidates"},{"ts":"2026-05-18T10:15:00Z","by":"Dr. Sarah Jenkins","action":"Assigned vouchers","detail":"18 vouchers assigned to candidates"}]},{"id":"sess_002","name":"Food Protection Manager \u2014 Final Assessment","organization":"SafeFood AI","examDate":"2026-05-21T14:00:00Z","startTime":"14:00","duration":90,"status":"completed","allowRetake":false,"maxRetakeAttempts":0,"retakeWindow":0,"createdAt":"2026-05-15T08:00:00Z","createdBy":"usr_001","candidateCount":22,"vouchersAssigned":22,"vouchersUsed":22,"vouchersAvailable":3,"activityLog":[{"ts":"2026-05-15T08:00:00Z","by":"Dr. Sarah Jenkins","action":"Created cohort","detail":"Initial creation"},{"ts":"2026-05-21T14:00:00Z","by":"System","action":"Session started","detail":"Session transitioned to Live"},{"ts":"2026-05-24T03:40:53.834Z","by":"Dr. Sarah Jenkins","action":"Updated session","detail":"Fields updated: status"}],"allowOnline":true,"onlinePayer":"student"},{"id":"sess_003","name":"HACCP Certification \u2014 Module 3 Quiz","organization":"SafeFood AI","examDate":"2026-05-25T10:00:00Z","startTime":"10:00","duration":60,"status":"draft","allowRetake":true,"maxRetakeAttempts":1,"retakeWindow":3,"createdAt":"2026-05-20T16:00:00Z","createdBy":"usr_001","candidateCount":8,"vouchersAssigned":0,"vouchersUsed":0,"vouchersAvailable":25,"activityLog":[{"ts":"2026-05-20T16:00:00Z","by":"Dr. Sarah Jenkins","action":"Created draft","detail":"8 candidates added, vouchers pending"}]},{"id":"sess_004","name":"Allergen Awareness \u2014 Midterm","organization":"SafeFood AI","examDate":"2026-05-19T11:00:00Z","startTime":"11:00","duration":90,"status":"completed","allowRetake":false,"maxRetakeAttempts":0,"retakeWindow":0,"createdAt":"2026-05-12T09:00:00Z","createdBy":"usr_001","candidateCount":15,"vouchersAssigned":15,"vouchersUsed":15,"vouchersAvailable":0,"activityLog":[{"ts":"2026-05-12T09:00:00Z","by":"Dr. Sarah Jenkins","action":"Created cohort","detail":"15 candidates enrolled"},{"ts":"2026-05-19T12:30:00Z","by":"System","action":"Session completed","detail":"All 15 candidates finished"}]},{"id":"sess_005","name":"Food Safety Auditor \u2014 Pop Quiz","organization":"SafeFood AI","examDate":"2026-06-26T15:00:00Z","startTime":"15:00","duration":45,"status":"upcoming","allowRetake":true,"maxRetakeAttempts":1,"retakeWindow":2,"createdAt":"2026-05-20T12:00:00Z","createdBy":"usr_001","candidateCount":12,"vouchersAssigned":10,"vouchersUsed":0,"vouchersAvailable":15,"activityLog":[{"ts":"2026-05-20T12:00:00Z","by":"Dr. Sarah Jenkins","action":"Created cohort","detail":"12 candidates added"}]},{"id":"sess_006","name":"test session","organization":"SafeFood AI","examDate":"2026-04-29","startTime":"16:37","duration":120,"status":"draft","allowRetake":false,"maxRetakeAttempts":0,"retakeWindow":0,"createdAt":"2026-05-22T09:03:57.200Z","createdBy":"usr_001","candidateCount":0,"vouchersAssigned":0,"vouchersUsed":0,"vouchersAvailable":446,"activityLog":[{"ts":"2026-05-22T09:03:57.200Z","by":"Dr. Sarah Jenkins","action":"Created cohort","detail":"Draft session created"}]},{"id":"sess_008","name":"Allergen Awareness \u2014 Retake Window","organization":"SafeFood AI","examDate":"2026-06-20","startTime":"09:00","duration":90,"status":"cancelled","allowRetake":true,"maxRetakeAttempts":2,"retakeWindow":7,"createdAt":"2026-05-25T10:00:00Z","createdBy":"system","candidateCount":24,"vouchersAssigned":20,"vouchersUsed":0,"vouchersAvailable":4,"readiness":65,"activityLog":[{"ts":"2026-05-25T10:00:00Z","by":"Dr. Sarah Jenkins","action":"Created cohort","detail":"24 candidates enrolled"}]},{"id":"sess_009","name":"Food Protection Manager \u2014 Live Cohort A","organization":"SafeFood AI","examDate":"2026-06-22","startTime":"09:00","duration":90,"status":"live","allowRetake":true,"maxRetakeAttempts":2,"retakeWindow":7,"createdAt":"2026-05-25T10:00:00Z","createdBy":"system","candidateCount":24,"vouchersAssigned":20,"vouchersUsed":0,"vouchersAvailable":4,"readiness":65,"activityLog":[{"ts":"2026-05-25T10:00:00Z","by":"Dr. Sarah Jenkins","action":"Created cohort","detail":"24 candidates enrolled"}]},{"id":"sess_010","name":"Allergen Awareness \u2014 Evening Session","organization":"SafeFood AI","examDate":"2026-06-22","startTime":"09:00","duration":90,"status":"ongoing","allowRetake":true,"maxRetakeAttempts":2,"retakeWindow":7,"createdAt":"2026-05-25T10:00:00Z","createdBy":"system","candidateCount":24,"vouchersAssigned":20,"vouchersUsed":0,"vouchersAvailable":4,"readiness":65,"activityLog":[{"ts":"2026-05-25T10:00:00Z","by":"Dr. Sarah Jenkins","action":"Created cohort","detail":"24 candidates enrolled"}]},{"id":"sess_011","name":"HACCP Principles \u2014 Morning Live","organization":"SafeFood AI","examDate":"2026-06-22","startTime":"09:00","duration":90,"status":"live","allowRetake":true,"maxRetakeAttempts":2,"retakeWindow":7,"createdAt":"2026-05-25T10:00:00Z","createdBy":"system","candidateCount":24,"vouchersAssigned":20,"vouchersUsed":0,"vouchersAvailable":4,"readiness":65,"activityLog":[{"ts":"2026-05-25T10:00:00Z","by":"Dr. Sarah Jenkins","action":"Created cohort","detail":"24 candidates enrolled"}]},{"id":"sess_012","name":"Culinary Fundamentals \u2014 Proctored","organization":"SafeFood AI","examDate":"2026-06-22","startTime":"09:00","duration":90,"status":"ongoing","allowRetake":true,"maxRetakeAttempts":2,"retakeWindow":7,"createdAt":"2026-05-25T10:00:00Z","createdBy":"system","candidateCount":24,"vouchersAssigned":20,"vouchersUsed":0,"vouchersAvailable":4,"readiness":65,"activityLog":[{"ts":"2026-05-25T10:00:00Z","by":"Dr. Sarah Jenkins","action":"Created cohort","detail":"24 candidates enrolled"}]},{"id":"sess_013","name":"Restaurant Manager Cert \u2014 Upcoming","organization":"SafeFood AI","examDate":"2026-06-22","startTime":"09:00","duration":90,"status":"upcoming","allowRetake":true,"maxRetakeAttempts":2,"retakeWindow":7,"createdAt":"2026-05-25T10:00:00Z","createdBy":"system","candidateCount":24,"vouchersAssigned":20,"vouchersUsed":0,"vouchersAvailable":4,"readiness":65,"activityLog":[{"ts":"2026-05-25T10:00:00Z","by":"Dr. Sarah Jenkins","action":"Created cohort","detail":"24 candidates enrolled"}]}],"/api/modules":[{"id":1,"title":"The Food Protection Manager's Handbook (Study Guide)","desc":"A detailed study guide to help increase exam-day confidence New Detailed Guide. Authors: Daniel John Stine, Chef Dominic Hawkes MCGB","icon":"menu_book","type":"document","duration":"120 mins","thumb":"/thumb_food_safety.png","contentTitle":"Study Guide"},{"id":2,"title":"The Food Protection Manager's Handbook Concise Edition","desc":"Your Fast-Track Guide to Certification Optimized for Busy Professionals. Authors: Daniel John Stine, Chef Dominic Hawkes MCGB","icon":"menu_book","type":"document","duration":"60 mins","thumb":"/thumb_haccp.png","contentTitle":"Concise Edition"},{"id":3,"title":"The Food Protection Manager's Handbook A PODCAST SERIES","desc":"YOUR ESSENTIAL GUIDE TO CERTIFICATION BASED ON THE 2022 FDA FOOD CODE. Author/Content Developer: Daniel John Stine. Host: Chef Dominic Hawkes MCGB","icon":"mic","type":"podcast","duration":"180 mins","thumb":"/thumb_culinary.png","contentTitle":"Podcast Series"},{"id":4,"title":"SDC Certifications Practice Examination","desc":"Quiz Question: When refilling a cup, never touch - No such restriction, The lip contact area, The middle, The bottom","icon":"quiz","type":"practice exam","duration":"90 mins","thumb":"/thumb_practice_exam.png","contentTitle":"Practice Exam"}],"/api/earnings":{"summary":{"totalEarnedThisMonth":4250,"sessionsCompleted":17,"pendingPayout":850,"lastPayoutDate":"2026-05-15T00:00:00Z"},"sessions":[{"sessionName":"Allergen Awareness \u2014 Midterm","date":"2026-05-19","duration":"90 min","rate":50,"amount":750,"payoutStatus":"paid"},{"sessionName":"ServSafe Food Handler \u2014 Practice Test","date":"2026-05-17","duration":"60 min","rate":50,"amount":500,"payoutStatus":"paid"},{"sessionName":"Food Protection Manager \u2014 Mock Exam","date":"2026-05-16","duration":"90 min","rate":50,"amount":750,"payoutStatus":"paid"},{"sessionName":"Food Safety Auditor \u2014 Quiz 2","date":"2026-05-14","duration":"45 min","rate":50,"amount":375,"payoutStatus":"paid"},{"sessionName":"HACCP Certification \u2014 Lab Test","date":"2026-05-12","duration":"120 min","rate":50,"amount":1000,"payoutStatus":"paid"},{"sessionName":"Food Protection Manager \u2014 Final Assessment","date":"2026-05-21","duration":"90 min","rate":50,"amount":850,"payoutStatus":"pending"}],"payouts":[{"date":"2026-05-15","amount":2375,"method":"Bank Transfer \u2014 Chase ****4829","status":"completed"},{"date":"2026-05-01","amount":3100,"method":"Bank Transfer \u2014 Chase ****4829","status":"completed"},{"date":"2026-04-15","amount":1875,"method":"Bank Transfer \u2014 Chase ****4829","status":"completed"},{"date":"2026-06-15","amount":420.0,"method":"Bank Transfer","status":"pending"},{"date":"2026-06-10","amount":280.0,"method":"PayPal","status":"processing"}]},"/api/reports":{}};
/**
 * SecureProctor AI v3 - Logic Engine
 */

const v3App = {
  openBatchModal: function(title, contentBase64) {
    const content = atob(contentBase64);
    const modalHtml = `
      <div id="batch-modal-overlay" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:9999;">
        <div style="background:var(--surface-color, #fff); width:90%; max-width:600px; border-radius:12px; padding:24px; box-shadow:0 8px 32px rgba(0,0,0,0.3); max-height:80vh; overflow-y:auto; position:relative;">
          <h2 style="margin-top:0; border-bottom:1px solid var(--border-color, #eee); padding-bottom:12px;">${title}</h2>
          <button onclick="const m = document.getElementById('batch-modal-overlay'); if(m) m.remove();" style="position:absolute; top:24px; right:24px; background:none; border:none; cursor:pointer; font-size:24px; color:var(--text-secondary, #666);">&times;</button>
          <div style="margin-top:16px;">
            ${content}
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },
  state: {
    dashboard: null,
    candidates: [],
    sessions: [],
    incidents: [],
    materials: [],
    earnings: null,
    reports: null,
    settings: null,
    currentView: 'dashboard',
    sessionViewMode: 'grid',
    materialViewMode: 'grid',
    monitorSse: null,
    monitorState: { session: null, candidates: [], alerts: [] }
  },

  async init() {
    this.bindEvents();
    await this.fetchData();
    
    // Default route
    this.switchView('dashboard');
  },

  bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchView(e.currentTarget.dataset.view);
      });
    });

    // Theme Toggle — drive `data-t` (the attribute the design-system CSS tokens
    // actually respond to) and persist, matching global_nav.js.
    const themeToggle = document.getElementById('theme-toggle');
    const applyThemeIcon = (t) => {
      if (themeToggle) themeToggle.innerHTML = t === 'dark'
        ? '<i class="material-icons-outlined">light_mode</i>'
        : '<i class="material-icons-outlined">dark_mode</i>';
    };
    if (themeToggle) {
      applyThemeIcon(document.documentElement.getAttribute('data-t') || 'light');
      themeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        const next = html.getAttribute('data-t') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-t', next);
        try { localStorage.setItem('sdc_theme', next); } catch (e) {}
        applyThemeIcon(next);
      });
    }

    // Mobile navigation: hamburger toggles the off-canvas sidebar + backdrop.
    const menuToggle = document.getElementById('menu-toggle');
    const backdrop = document.getElementById('sidebar-backdrop');
    const sidebar = document.querySelector('.sidebar');
    const closeNav = () => { sidebar && sidebar.classList.remove('open'); backdrop && backdrop.classList.remove('show'); };
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        const open = sidebar.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('show', open);
      });
    }
    if (backdrop) backdrop.addEventListener('click', closeNav);
    // Close the drawer after picking a destination on mobile.
    document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', closeNav));

    // Global Search
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (this.state.currentView === 'candidates') {
           const filtered = this.state.candidates.filter(c => c.name.toLowerCase().includes(query) || (c.rollNo && c.rollNo.toLowerCase().includes(query)));
           this.renderCandidatesList(filtered);
        } else if (this.state.currentView === 'sessions') {
           const filtered = this.state.sessions.filter(s => s.name.toLowerCase().includes(query));
           this.renderSessionsList(filtered);
        }
      });
    }

    // Notifications
    const notifBtn = document.getElementById('notification-btn');
    const notifDropdown = document.getElementById('notification-dropdown');
    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.style.display = notifDropdown.style.display === 'none' ? 'block' : 'none';
      });
      document.addEventListener('click', () => {
        notifDropdown.style.display = 'none';
      });
      notifDropdown.addEventListener('click', e => e.stopPropagation());
    }
  },

  signOut() {
    this.showToast('Signing out...', 'info');
    setTimeout(() => {
      document.body.innerHTML = `
        <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:var(--bg-color);">
           <div style="background:var(--surface-color); padding:40px; border-radius:12px; border:1px solid var(--border-color); text-align:center; box-shadow:var(--shadow-lg);">
              <i class="material-icons-outlined" style="font-size:48px; color:var(--brand-primary); margin-bottom:16px;">lock</i>
              <h2>SecureProctor AI</h2>
              <p style="color:var(--text-secondary); margin:8px 0 24px 0;">You have been safely signed out.</p>
              <button class="btn btn-primary" onclick="location.reload()">Sign In Again</button>
           </div>
        </div>
      `;
    }, 800);
  },

  // ==========================================================================
  // AUTHENTICATION
  // ==========================================================================
  authStartRegistration() {
    document.getElementById('view-login').classList.remove('active');
    document.getElementById('view-reg-0').classList.add('active');
    document.getElementById('flow-title').textContent = 'Proctor Certification';
    document.getElementById('flow-subtitle').textContent = 'Complete onboarding to get approved';
  },

  authForgotPassword(e) {
    if (e) e.preventDefault();
    const el = document.getElementById('login-email');
    const email = el ? el.value.trim() : '';
    if (!email) { if (el) el.focus(); this.showToast('Enter your email above, then tap Forgot password.', 'info'); return; }
    this.showToast('Password reset link sent to ' + email, 'success');
  },

  authPlayVideo(element) {
    // Self-contained training placeholder — no external (YouTube) dependency, so
    // the user is never stuck behind a video that fails to load. Watching it
    // unlocks the next step.
    element.innerHTML = '<div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; color:#fff; background:#111; border-radius:8px;">' +
      '<i class="material-icons-outlined" style="font-size:40px;">play_circle</i>' +
      '<div style="font-size:13px; font-weight:600;">Training video played</div>' +
      '<div style="font-size:11px; opacity:.7;">Platform integrity & incident management</div></div>';
    const btn = document.getElementById('btn-reg-1');
    if (btn) btn.disabled = false;
  },

  checkRegStep0() {
    const name = document.getElementById('input-reg-name')?.value.trim();
    const email = document.getElementById('input-reg-email')?.value.trim();
    const btn = document.getElementById('btn-reg-0');
    if (btn) btn.disabled = !(name && email);
  },

  // Generate a 10-character alphanumeric Proctor SDC ID (uppercase letters + digits)
  generateProctorId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
      // Avoid Math.random in a way that's fine for a mock prototype
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  },

  authNextStep(step) {
    document.querySelectorAll('.view-step').forEach(el => el.classList.remove('active'));
    document.getElementById('view-reg-' + step).classList.add('active');
    if (step === 'success') {
      // Generate and persist the Proctor SDC ID + a 3-year validity date
      const proctorId = this.generateProctorId();
      const issued = new Date();
      const expiry = new Date(issued.getFullYear() + 3, issued.getMonth(), issued.getDate());
      this.state.proctorId = proctorId;
      this.state.proctorIdIssued = issued.toISOString();
      this.state.proctorIdExpiry = expiry.toISOString();
      try {
        localStorage.setItem('proctorId', proctorId);
        localStorage.setItem('proctorIdExpiry', expiry.toISOString());
      } catch (e) {}
      const el = document.getElementById('reg-success-sdc-id');
      if (el) el.textContent = proctorId;
    }
  },

  authCheckQuiz() {
    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');
    if (q1 && q2 && q1.value === 'correct' && q2.value === 'correct') {
      this.showToast('All answers correct!', 'success');
      this.authNextStep(3);
    } else {
      this.showToast('Some answers are incorrect. Please try again.', 'error');
    }
  },

  authSubmitApproval() {
    this.showToast('Application Submitted. Generating Verified Badge...', 'success');
    setTimeout(() => {
      this.authNextStep('success');
    }, 1500);
  },

  authLogin() {
    const email = document.getElementById('login-email')?.value;
    const pass = document.getElementById('login-password')?.value;
    if (!email || !pass) {
      this.showToast('Please enter both email and password.', 'error');
      return;
    }
    this.completeAuth();
  },

  completeAuth() {
    this.showToast('Welcome to SecureProctor AI', 'success');
    document.getElementById('auth-overlay').classList.add('fade-out');
    // Ensure dashboard is visible
    this.switchView('dashboard');
  },

  async fetchData() {

    try {
      this.state.dashboard = MOCK_API_DATA['/api/dashboard'] || {};
      this.state.candidates = MOCK_API_DATA['/api/candidates'] || [];
      if (Array.isArray(this.state.candidates)) {
        this.state.candidates.forEach(cand => {
          let vStatus = (cand.voucherStatus || '').toLowerCase();
          let isUnassigned = vStatus === 'not_assigned' || vStatus === 'unassigned' || vStatus === '';
          if (!cand.voucherCode && !isUnassigned) cand.voucherCode = 'VOUCH-' + Math.floor(Math.random()*9000+1000);
          if (!cand.sessionName) cand.sessionName = 'Data Science 101 Bootcamp';
          if (cand.readHours === undefined) cand.readHours = Math.floor(Math.random() * 20);
          if (cand.totalHours === undefined) cand.totalHours = 20;
          if (!cand.pastSessions && Math.random() > 0.5) cand.pastSessions = [{ name: 'Midterm Evaluation', score: '88%', certLink: '#' }];
        });
      }
      this.state.sessions = MOCK_API_DATA['/api/sessions'] || [];
      this.state.materials = MOCK_API_DATA['/api/modules'] || [];
      this.state.earnings = MOCK_API_DATA['/api/earnings'] || {};
      this.state.reports = MOCK_API_DATA['/api/reports'] || {};
      
      this.state.incidents = this.state.dashboard?.pendingIncidents || [];
      
      const badge = document.getElementById('notif-badge');
      if (badge) {
        if (this.state.incidents.length > 0) {
          badge.style.display = 'flex';
          badge.textContent = this.state.incidents.length;
        } else {
          badge.style.display = 'none';
        }
      }
      
      this.renderDashboard();
      document.getElementById('loading-overlay').style.display = 'none';
    } catch (err) {
      console.error(err);
      this.showToast('Failed to load data', 'error');
    }
        
  },

  switchView(viewId) {
    if (this.state.currentView !== 'monitoring' && viewId !== 'monitoring') {
      // Do nothing special
    }
    
    if (viewId !== 'monitoring' && this.state.monitorSse) {
      this.state.monitorSse.close();
      this.state.monitorSse = null;
    }

    this.state.currentView = viewId;
    
    // Update Sidebar
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    // Update Main Area
    document.querySelectorAll('.workspace').forEach(ws => {
      ws.classList.remove('active');
    });
    
    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.add('active');

    // Update Title
    const titles = {
      'dashboard': 'Dashboard',
      'monitoring': 'Live Class Monitoring',
      'candidates': 'Candidate Directory',
      'sessions': 'Class Lifecycle Management',
      'materials': 'Learning Materials',
      'earnings': 'Earnings & Payments',
      'reports': 'Reports & Analytics',
      'settings': 'Platform Settings'
    };
    document.getElementById('view-title').textContent = titles[viewId] || 'SecureProctor AI';
    
    // Toggle Proctor Resources side panel
    const pPanel = document.getElementById('proctor-resources-panel');
    if (pPanel) {
      if (viewId === 'dashboard') {
        pPanel.style.transform = 'translateX(0)';
      } else {
        pPanel.style.transform = 'translateX(100%)';
      }
    }

    this.renderCurrentView();
  },

  renderCurrentView() {
    if (this.state.currentView === 'dashboard') this.renderDashboard();
    if (this.state.currentView === 'monitoring') this.renderMonitoring();
    if (this.state.currentView === 'candidates') this.renderCandidates('all');
    if (this.state.currentView === 'sessions') this.renderSessions('all');
    if (this.state.currentView === 'materials') this.renderMaterials();
    if (this.state.currentView === 'earnings') this.renderEarnings();
    if (this.state.currentView === 'reports') this.renderReports();
    if (this.state.currentView === 'settings') this.renderSettings();
  },

  // ==========================================================================
  // DASHBOARD RENDERING
  // ==========================================================================
  renderDashboard() {
    const dash = this.state.dashboard;
    if (!dash) return;

    // 1. KPIs
    const kpiGrid = document.getElementById('dashboard-kpis');
    if (kpiGrid) {
      kpiGrid.innerHTML = `
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Active Live Classes</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:var(--brand-primary);">${dash.activeLiveSessions || 0}</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Upcoming Classes (7D)</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px;">${dash.upcomingExams7Days || 0}</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Pending Incidents</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:${dash.pendingIncidentCount > 0 ? 'var(--status-error)' : 'inherit'};">${dash.pendingIncidentCount || 0}</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Available Voucher Codes</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:var(--status-success);">${dash.voucherBalance?.available || 0}</div>
        </div>
      `;
    }

    // 2. Upcoming Feed
    const upcoming = document.getElementById('dash-upcoming-feed');
    if (upcoming && dash.upcomingSessions) {
      // Only show classes whose exam date is still in the future — a past-dated
      // session shouldn't appear under "Upcoming" (keeps this in sync with the
      // 7-day KPI, which is already date-bounded server-side).
      const now = new Date();
      const upcomingList = dash.upcomingSessions.filter(s => new Date(s.examDate) >= now);
      if (upcomingList.length === 0) {
        upcoming.innerHTML = `<div style="color:var(--text-secondary); font-size:14px; text-align:center; padding:20px;">No upcoming classes scheduled.</div>`;
      } else {
        upcoming.innerHTML = upcomingList.map(s => `
          <div style="padding:12px 0; border-bottom:1px solid var(--border-light); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:600; font-size:14px;">${s.name}</div>
              <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">
                <i class="material-icons-outlined" style="font-size:12px; vertical-align:middle;">schedule</i> ${new Date(s.examDate).toLocaleString()}
              </div>
            </div>
            <div class="badge badge-info">${s.candidateCount} Enrolled</div>
          </div>
        `).join('');
      }
    }

    // 3. Action Feed
    const actionFeed = document.getElementById('dash-action-feed');
    if (actionFeed && dash.pendingIncidents) {
      if (dash.pendingIncidents.length === 0) {
        actionFeed.innerHTML = `<div style="color:var(--status-success); font-size:14px; text-align:center; padding:20px; background:var(--status-success-bg); border-radius:8px;">All caught up! No pending actions.</div>`;
      } else {
        actionFeed.innerHTML = dash.pendingIncidents.map(inc => `
          <div style="padding:12px; background:var(--status-error-bg); border-radius:8px; margin-bottom:8px; border-left:4px solid var(--status-error);">
            <div style="display:flex; justify-content:space-between;">
              <strong style="font-size:13px; color:var(--status-error);">${inc.type}</strong>
              <span style="font-size:11px; color:var(--text-secondary);">${new Date(inc.timestamp).toLocaleTimeString()}</span>
            </div>
            <div style="font-size:13px; margin-top:4px; font-weight:500;">${inc.candidateName}</div>
          </div>
        `).join('');
      }
    }

    // 4. Proctor Credential (SDC ID + 3-year validity)
    this.renderProctorCredential();
  },

  renderProctorCredential() {
    const idEl = document.getElementById('dash-sdc-id');
    const expEl = document.getElementById('dash-sdc-expiry');
    if (!idEl || !expEl) return;

    // Use the ID minted during registration; otherwise restore from storage or
    // mint one for returning (logged-in) proctors so the card is never empty.
    let pid = this.state.proctorId;
    let expiryIso = this.state.proctorIdExpiry;
    if (!pid) {
      try { pid = localStorage.getItem('proctorId'); expiryIso = localStorage.getItem('proctorIdExpiry'); } catch (e) {}
    }
    if (!pid) {
      pid = this.generateProctorId();
      const issued = new Date();
      const expiry = new Date(issued.getFullYear() + 3, issued.getMonth(), issued.getDate());
      expiryIso = expiry.toISOString();
      this.state.proctorId = pid;
      this.state.proctorIdExpiry = expiryIso;
      try { localStorage.setItem('proctorId', pid); localStorage.setItem('proctorIdExpiry', expiryIso); } catch (e) {}
    }
    this.state.proctorId = pid;
    this.state.proctorIdExpiry = expiryIso;
    idEl.textContent = pid;
    expEl.textContent = expiryIso
      ? new Date(expiryIso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      : '—';
  },

  // ==========================================================================
  // CANDIDATES RENDERING
  // ==========================================================================
  filterCandidates(status) {
    // Toggle the active state on the filter chips.
    document.querySelectorAll('#candidate-filters .filter-chip').forEach(b => {
      const oc = b.getAttribute('onclick') || '';
      b.classList.toggle('active', oc.includes(`'${status}'`));
    });

    this.renderCandidates(status);
  },

  // Exam assessments and the pool of voucher codes the org holds for each.
  examAssessments: [
    { id: 'food_handler', name: 'Food Handler Certification', vouchers: 500 },
    { id: 'fpm', name: 'Food Protection Manager (FPM)', vouchers: 320 },
    { id: 'haccp', name: 'HACCP Certification', vouchers: 180 },
    { id: 'allergen', name: 'Allergen Awareness', vouchers: 75 },
    { id: 'culinary', name: 'Professional Culinary Exam', vouchers: 40 }
  ],

  // When an Exam Assessment is picked, surface how many voucher codes are
  // available for it (Task 5).
  onExamAssessmentChange() {
    const sel = document.getElementById('form-s-assessment');
    const info = document.getElementById('form-s-voucher-info');
    const count = document.getElementById('form-s-voucher-count');
    if (!sel || !info || !count) return;
    const a = this.examAssessments.find(x => x.id === sel.value);
    if (a) {
      count.textContent = a.vouchers;
      info.style.display = 'block';
    } else {
      info.style.display = 'none';
    }
  },

  // Show/enable retake options only when "Allow Retake" is on; otherwise hide
  // and disable them so no retake config can be set (Task 7).
  toggleSessionRetake(isChecked) {
    const opts = document.getElementById('form-s-retake-options');
    if (!opts) return;
    opts.style.display = isChecked ? 'block' : 'none';
    opts.querySelectorAll('input, select').forEach(el => {
      el.disabled = !isChecked;
      if (!isChecked && el.type === 'checkbox') el.checked = false;
    });
  },

  // ─── Add Candidate drawer: existing-vs-new modes ───────────────
  setAddCandidateMode(mode) {
    this._acMode = mode;
    const existing = document.getElementById('ac-existing-block');
    const neu = document.getElementById('ac-new-block');
    if (existing) existing.style.display = mode === 'existing' ? 'block' : 'none';
    if (neu) neu.style.display = mode === 'new' ? 'block' : 'none';
    const ce = document.getElementById('acm-existing');
    const cn = document.getElementById('acm-new');
    if (ce) ce.classList.toggle('active', mode === 'existing');
    if (cn) cn.classList.toggle('active', mode === 'new');
    const btn = document.getElementById('drawer-action-btn');
    if (btn) btn.textContent = mode === 'new' ? 'Add & Save to Directory' : 'Add to Class';
  },

  // Render directory matches into the existing-mode results list.
  searchDirectory(query) {
    const box = document.getElementById('ac-results');
    if (!box) return;
    const q = (query || '').trim().toLowerCase();
    const matches = (this.state.candidates || []).filter(c =>
      !q || (c.name || '').toLowerCase().includes(q)
         || (c.email || '').toLowerCase().includes(q)
         || (c.rollNo || '').toLowerCase().includes(q));
    if (matches.length === 0) {
      box.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-secondary); font-size:13px;">No students found. Switch to <strong>New student</strong> to add them.</div>`;
      return;
    }
    box.innerHTML = matches.map(c => {
      const sel = c.id === this._acSelectedId;
      return `<div onclick="v3App.selectDirectoryCandidate('${c.id}')" style="display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; border-bottom:1px solid var(--border-light); ${sel ? 'background:var(--pri-con, rgba(249,173,0,0.12));' : ''}">
        <div style="width:30px; height:30px; border-radius:50%; background:var(--border-light); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:var(--text-secondary);">${(c.name || '?').charAt(0).toUpperCase()}</div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:13px; font-weight:600; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.name || 'Unnamed'}</div>
          <div style="font-size:11px; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.email || ''}${c.rollNo && c.rollNo !== 'N/A' ? ' · ' + c.rollNo : ''}</div>
        </div>
        ${sel ? '<i class="material-icons-outlined" style="color:var(--pri); font-size:20px;">check_circle</i>' : ''}
      </div>`;
    }).join('');
  },

  selectDirectoryCandidate(id) {
    this._acSelectedId = (this._acSelectedId === id) ? null : id;
    this.searchDirectory(document.getElementById('ac-search') ? document.getElementById('ac-search').value : '');
  },

  submitAddCandidate() {
    const classSel = document.getElementById('ac-class');
    const classId = classSel ? classSel.value : '';
    const session = (this.state.sessions || []).find(s => s.id === classId);
    const className = session ? session.name : '';

    if (this._acMode === 'new') {
      const name = (document.getElementById('form-name') || {}).value || '';
      const email = (document.getElementById('form-email') || {}).value || '';
      if (!name.trim() || !email.trim()) { this.showToast('Name and Email are required.', 'error'); return; }
      const cand = {
        id: 'cand_' + Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        email: email.trim(),
        rollNo: ((document.getElementById('form-roll') || {}).value || 'N/A').trim() || 'N/A',
        examStatus: 'enrolled',
        voucherStatus: 'unassigned',
        sessionId: classId || null,
        photo: 'https://via.placeholder.com/150'
      };
      this.state.candidates.unshift(cand); // saved to the Candidate Directory
      if (session) session.candidateCount = (session.candidateCount || 0) + 1;
      this.renderCandidates('all');
      this.closeDrawer();
      this.showToast(`${cand.name} saved to Candidate Directory${className ? ' & added to ' + className : ''}.`, 'success');
      return;
    }

    // Existing student
    if (!this._acSelectedId) { this.showToast('Select a student from the directory first.', 'error'); return; }
    const cand = (this.state.candidates || []).find(c => c.id === this._acSelectedId);
    if (!cand) { this.showToast('Selected student not found.', 'error'); return; }
    if (!classId) { this.showToast('Choose a class to add this student to.', 'error'); return; }
    cand.sessionId = classId;
    if (session) session.candidateCount = (session.candidateCount || 0) + 1;
    this.renderCandidates('all');
    this.closeDrawer();
    this.showToast(`${cand.name} added to ${className}.`, 'success');
  },

  renderCandidates(filter) {
    const tbody = document.getElementById('candidates-tbody');
    if (!tbody) return;

    let filtered = this.state.candidates;
    if (filter !== 'all') {
      filtered = filtered.filter(c => c.examStatus === filter);
    }

    this.renderCandidatesList(filtered);
  },

  renderCandidatesList(filtered) {
    const tbody = document.getElementById('candidates-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates match this filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(c => {
      // Format Status
      let statusBadge = '';
      if (c.examStatus === 'completed') statusBadge = `<span class="badge badge-success">Completed</span>`;
      else if (c.examStatus === 'in_progress') statusBadge = `<span class="badge badge-warning">Active</span>`;
      else statusBadge = `<span class="badge" style="background:rgba(0, 99, 155, 0.1); color:var(--inf); border:1px solid rgba(0, 99, 155, 0.2);">Enrolled</span>`;

      // Voucher Code Status
      let vStatus = (c.voucherStatus || '').toLowerCase();
      let isUnassigned = vStatus === 'not_assigned' || vStatus === 'unassigned' || vStatus === '';
      let isPending = vStatus === 'pending' || vStatus === 'assigned';
      let isActivated = vStatus === 'activated' || vStatus === 'redeemed';

      // Read-only redeem button shown next to unassigned/pending voucher status.
      const redeemBtn = `<button class="btn btn-secondary" style="padding:3px 10px; font-size:11px; white-space:nowrap;" onclick="event.stopPropagation(); v3App.openRedeemVoucherModal('${c.id}')"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">redeem</i> Redeem Voucher Code</button>`;

      let voucherHtml = '';
      if (isUnassigned) {
        // Status is read-only (a plain label, not an editable control); redemption
        // happens through the dedicated button only (Task 8).
        voucherHtml = `<div style="display:flex; align-items:center; gap:8px;"><span style="color:var(--status-warning); font-size:12px; font-weight:600;" title="Read-only status"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">warning</i> not assigned</span>${redeemBtn}</div>`;
      } else if (isPending) {
        voucherHtml = `<div style="display:flex; align-items:center; gap:8px;"><span class="font-mono" style="background:var(--border-light); padding:4px 8px; border-radius:4px; font-size:12px;">${c.voucherCode || 'PENDING'}</span><span class="badge badge-warning" title="Read-only status">Pending</span>${redeemBtn}</div>`;
      } else if (isActivated) {
        voucherHtml = `<div style="display:flex; align-items:center; gap:8px;"><span class="font-mono" style="background:var(--border-light); padding:4px 8px; border-radius:4px; font-size:12px;">${c.voucherCode || 'REDEEMED'}</span><span class="badge badge-success">Activated</span></div>`;
      } else {
        voucherHtml = `<div style="display:flex; align-items:center; gap:8px;"><span class="font-mono" style="background:var(--border-light); padding:4px 8px; border-radius:4px; font-size:12px;">${c.voucherCode || 'VOUCH'}</span><span class="badge">${c.voucherStatus}</span></div>`;
      }

      let examResult = '<span style="color:var(--text-tertiary);">-</span>';
      if (c.examStatus === 'completed') {
        if (c.examScore === undefined) {
           c.examScore = Math.floor(Math.random() * 80) + 20;
        }
        const passed = c.examScore > 50;
        examResult = passed ? '<span style="color:var(--status-success); font-weight:600;">Pass</span>' : '<span style="color:var(--status-error); font-weight:600;">Fail</span>';
      }

      return `
        <tr style="cursor:pointer;" onclick="if(!event.target.closest('input') && !event.target.closest('button')) v3App.openCandidateDrawer('${c.id}')">
          <td><input type="checkbox" class="cand-checkbox" onchange="v3App.updateBulkActions()"></td>
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${c.photo || 'https://via.placeholder.com/150'}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
              <div>
                <div style="font-weight:600; font-size:14px;">${c.name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${c.email}</div>
              </div>
            </div>
          </td>
          <td class="font-mono" style="font-size:13px; color:var(--text-secondary);">${c.rollNo || c.id}</td>
          <td>${voucherHtml}</td>
          <td>${statusBadge}</td>
          <td>${examResult}</td>
          <td><button class="btn btn-secondary" style="padding:4px 12px; font-size:12px;" onclick="v3App.openCandidateDrawer('${c.id}')">Manage</button></td>
        </tr>
      `;
    }).join('');
    
    this.updateBulkActions();
  },

  toggleAllCandidates(e) {
    document.querySelectorAll('.cand-checkbox').forEach(cb => cb.checked = e.target.checked);
    this.updateBulkActions();
  },

  updateBulkActions() {
    const checked = document.querySelectorAll('.cand-checkbox:checked').length;
    let actionBar = document.getElementById('bulk-action-bar');
    
    if (checked > 0) {
      if (!actionBar) {
        actionBar = document.createElement('div');
        actionBar.id = 'bulk-action-bar';
        actionBar.style.cssText = 'position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--text-primary); color:var(--surface-color); padding:16px 24px; border-radius:12px; display:flex; align-items:center; gap:24px; box-shadow:var(--shadow-lg); z-index:90;';
        document.body.appendChild(actionBar);
      }
      actionBar.innerHTML = `
        <div style="font-weight:600;">${checked} candidates selected</div>
        <div style="display:flex; gap:12px;">
          <button class="btn" style="background:var(--surface-color); color:var(--text-primary);" onclick="v3App.showToast('Voucher Codes assigned to ${checked} candidates.', 'success'); v3App.clearBulkActions();"><i class="material-icons">confirmation_number</i> Bulk Assign Voucher Codes</button>
          <button class="btn btn-danger" onclick="v3App.showToast('${checked} candidates deactivated.', 'error'); v3App.clearBulkActions();"><i class="material-icons">block</i> Deactivate Selected</button>
        </div>
      `;
    } else if (actionBar) {
      actionBar.remove();
    }
  },

  clearBulkActions() {
    document.querySelectorAll('.cand-checkbox').forEach(cb => cb.checked = false);
    const selectAll = document.getElementById('bulk-select-all');
    if (selectAll) selectAll.checked = false;
    this.updateBulkActions();
  },

  // ==========================================================================
  // SESSIONS RENDERING
  // ==========================================================================
  filterSessions(status) {
    document.querySelectorAll('#session-filters .badge').forEach(b => {
      b.className = 'badge';
      b.style.background = 'var(--border-light)';
      b.style.color = 'var(--text-secondary)';
      if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${status}'`)) {
        b.className = 'badge badge-info';
        b.style.background = '';
        b.style.color = '';
      }
    });

    this.renderSessions(status);
  },

  renderSessions(filter) {
    const grid = document.getElementById('sessions-grid');
    if (!grid) return;

    let filtered = this.state.sessions;
    if (filter !== 'all') {
      filtered = filtered.filter(s => s.status === filter);
    }

    this.renderSessionsList(filtered);
  },

  setSessionViewMode(mode) {
    this.state.sessionViewMode = mode;
    
    // Update button states
    const gridBtn = document.getElementById('btn-grid-view');
    const tableBtn = document.getElementById('btn-table-view');
    if (gridBtn && tableBtn) {
      gridBtn.style.background = mode === 'grid' ? 'var(--border-light)' : 'transparent';
      gridBtn.style.color = mode === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)';
      tableBtn.style.background = mode === 'table' ? 'var(--border-light)' : 'transparent';
      tableBtn.style.color = mode === 'table' ? 'var(--text-primary)' : 'var(--text-secondary)';
    }

    // Toggle container visibility
    const gridContainer = document.getElementById('sessions-grid');
    const tableContainer = document.getElementById('sessions-table-container');
    if (gridContainer && tableContainer) {
      gridContainer.style.display = mode === 'grid' ? 'grid' : 'none';
      tableContainer.style.display = mode === 'table' ? 'block' : 'none';
    }

    // Re-render
    const currentFilter = document.querySelector('#session-filters .badge-info');
    let status = 'all';
    if (currentFilter && currentFilter.getAttribute('onclick')) {
      const match = currentFilter.getAttribute('onclick').match(/'([^']+)'/);
      if (match) status = match[1];
    }
    this.renderSessions(status);
  },

  renderSessionsList(filtered) {
    const grid = document.getElementById('sessions-grid');
    const tbody = document.getElementById('sessions-tbody');
    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-secondary);">No classes match this filter.</div>`;
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-secondary);">No classes match this filter.</td></tr>`;
      return;
    }

    const mode = this.state.sessionViewMode || 'grid';

    if (mode === 'grid') {
      grid.innerHTML = filtered.map(s => {
        let badgeClass = 'badge';
        if (s.status === 'live' || s.status === 'ongoing') badgeClass += ' badge-success';
        else if (s.status === 'upcoming' || s.status === 'review') badgeClass += ' badge-info';
        else if (s.status === 'completed') badgeClass += ' badge-warning';
        else if (s.status === 'draft') badgeClass += ' badge-warning';
        else { badgeClass += ''; }

        const dateStr = s.createdAt ? new Date(s.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
        const examDateStr = s.examDate ? new Date(s.examDate).toLocaleDateString() : '';

        return `
          <div class="card" style="display:flex; flex-direction:column; gap:16px;">
            <div class="flex-between">
              <span class="${badgeClass}">${s.status.toUpperCase()}</span>
              <div style="position:relative;">
                <button class="icon-button" onclick="event.stopPropagation(); const m = this.nextElementSibling; m.style.display = m.style.display==='block'?'none':'block';"><i class="material-icons">more_horiz</i></button>
                <div class="session-menu" style="display:none; position:absolute; right:0; top:36px; background:var(--surface-color); border:1px solid var(--border-color); box-shadow:var(--shadow-md); border-radius:8px; z-index:10; width:150px; overflow:hidden;">
                   <div style="padding:10px 16px; cursor:pointer; font-size:13px;" onclick="event.stopPropagation(); this.parentElement.style.display='none'; v3App.showToast('Editing class...', 'info');">Edit Class</div>
                   <div style="padding:10px 16px; cursor:pointer; font-size:13px;" onclick="event.stopPropagation(); this.parentElement.style.display='none'; v3App.showToast('Class duplicated.', 'success');">Duplicate</div>
                   <div style="padding:10px 16px; cursor:pointer; font-size:13px; color:var(--status-error); border-top:1px solid var(--border-light);" onclick="event.stopPropagation(); this.parentElement.style.display='none'; v3App.deleteSession('${s.id}')">Delete</div>
                </div>
              </div>
            </div>
            <div>
              <h3 style="font-size:16px; font-weight:600; margin-bottom:4px;">${s.name} | B1 | 2026</h3>
              <div style="font-size:12px; font-weight:600; color:var(--brand-primary); margin-bottom:8px; display:none;">CLASS YEAR/BATCH NUMBER: 2026-B1</div>
              
              <div style="font-size:13px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <i class="material-icons-outlined" style="font-size:16px;">calendar_today</i> Created ${dateStr}
              </div>
              ${examDateStr ? `<div style="font-size:13px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <i class="material-icons-outlined" style="font-size:16px;">event</i> Class / Exam: ${examDateStr}
              </div>` : `<div style="font-size:13px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <i class="material-icons-outlined" style="font-size:16px;">event</i> Class / Exam: Pending Schedule
              </div>`}
              <div style="font-size:13px; color:var(--text-secondary); display:flex; align-items:center; gap:6px;">
                <i class="material-icons-outlined" style="font-size:16px;">location_on</i> Campus Lab A / Online
              </div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; padding-top:16px; border-top:1px solid var(--border-light);">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <span style="color:var(--text-tertiary); font-size:11px; text-transform:uppercase; font-weight:600;">Candidates</span>
                <div style="font-weight:600; display:flex; align-items:center; gap:4px;"><i class="material-icons-outlined" style="font-size:16px;">people</i> ${s.candidateCount || s.candidates || 18}</div>
              </div>
              <div style="display:flex; flex-direction:column; text-align:right; gap:4px;">
                <span style="color:var(--text-tertiary); font-size:11px; text-transform:uppercase; font-weight:600;">Class Readiness</span>
                <div style="display:flex; align-items:center; justify-content:flex-end; gap:6px;">
                  <i class="material-icons-outlined" style="font-size:16px;">schedule</i> <span style="font-weight:600; color:var(--brand-primary);">${s.readiness || 0}%</span>
                </div>
              </div>
            </div>
            <button class="btn btn-secondary" style="width:100%; margin-top:auto; ${(s.status === 'live') ? 'background:var(--status-error); border-color:var(--status-error); color:var(--err-ct);' : (s.status === 'ongoing' ? 'background:var(--status-warning); border-color:var(--status-warning); color:var(--wrn-ct);' : '')}" onclick="${(s.status === 'live') ? `v3App.switchView('monitoring')` : `v3App.openSessionDetail('${s.id}')`}">
              ${(s.status === 'live') ? 'Monitor Class' : (s.status === 'ongoing' ? 'Manage Ongoing Class' : 'View Class')}
            </button>
          </div>
        `;
      }).join('');
    } else if (tbody) {
      tbody.innerHTML = filtered.map(s => {
        let badgeClass = 'badge';
        if (s.status === 'live' || s.status === 'ongoing') badgeClass += ' badge-success';
        else if (s.status === 'upcoming' || s.status === 'review') badgeClass += ' badge-info';
        else if (s.status === 'completed') badgeClass += ' badge-warning';
        else if (s.status === 'draft') badgeClass += ' badge-warning';
        else { badgeClass += ''; }

        const dateStr = s.createdAt ? new Date(s.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
        const examDateStr = s.examDate ? new Date(s.examDate).toLocaleDateString() : 'Pending Schedule';

        return `
          <tr style="cursor:pointer;" onclick="${(s.status === 'live') ? `v3App.switchView('monitoring')` : `v3App.openSessionDetail('${s.id}')`}">
            <td style="font-weight:600;">${s.name}</td>
            <td><span class="${badgeClass}">${s.status.toUpperCase()}</span></td>
            <td>${dateStr}</td>
            <td>${examDateStr}</td>
            <td>${s.candidateCount || s.candidates || 18}</td>
            <td style="font-weight:600; color:var(--brand-primary);">${s.readiness || 0}%</td>
            <td>
               <button class="btn btn-secondary" style="padding:4px 12px; font-size:12px; ${(s.status === 'live') ? 'color:var(--status-error); border-color:var(--status-error);' : ''}" onclick="event.stopPropagation(); ${(s.status === 'live') ? `v3App.switchView('monitoring')` : `v3App.openSessionDetail('${s.id}')`}">
                 ${(s.status === 'live') ? 'Monitor' : 'Manage'}
               </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  },


  deleteSession(id) {
    if(confirm('Are you sure you want to delete this class?')) {
      this.state.sessions = this.state.sessions.filter(s => s.id !== id);
      this.renderSessions('all');
      this.showToast('Class deleted.', 'success');
    }
  },

  // ==========================================================================
  // LEARNING MATERIALS RENDERING
  // ==========================================================================
  setMaterialViewMode(mode) {
    this.state.materialViewMode = mode;
    
    // Update button states
    const gridBtn = document.getElementById('btn-mat-grid-view');
    const tableBtn = document.getElementById('btn-mat-table-view');
    if (gridBtn && tableBtn) {
      gridBtn.style.background = mode === 'grid' ? 'var(--border-light)' : 'transparent';
      gridBtn.style.color = mode === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)';
      tableBtn.style.background = mode === 'table' ? 'var(--border-light)' : 'transparent';
      tableBtn.style.color = mode === 'table' ? 'var(--text-primary)' : 'var(--text-secondary)';
    }

    // Toggle container visibility
    const gridContainer = document.getElementById('materials-grid');
    const tableContainer = document.getElementById('materials-table-container');
    if (gridContainer && tableContainer) {
      gridContainer.style.display = mode === 'grid' ? 'grid' : 'none';
      tableContainer.style.display = mode === 'table' ? 'block' : 'none';
    }

    this.renderMaterials();
  },

  renderMaterials() {
    const grid = document.getElementById('materials-grid');
    const tbody = document.getElementById('materials-tbody');
    if (!grid) return;

    if (!this.state.materials || this.state.materials.length === 0) {
      grid.innerHTML = `<div style="text-align:center; padding:32px; color:var(--text-secondary); width:100%; grid-column:1/-1;">
        <i class="material-icons-outlined" style="font-size:32px; margin-bottom:12px; opacity:0.5;">menu_book</i><br>No learning materials uploaded yet.
      </div>`;
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-secondary);">No learning materials uploaded yet.</td></tr>`;
      return;
    }

    const mode = this.state.materialViewMode || 'grid';

    if (mode === 'grid') {
      grid.innerHTML = this.state.materials.map((m, i) => {
        const type = (m.type || 'Ebook').toLowerCase();
        let icon = 'menu_book';
        let ctaText = 'Manage';
        if (type === 'video') { icon = 'play_circle'; }
        else if (type === 'podcast') { icon = 'mic'; }
        else if (type === 'flashcard') { icon = 'style'; }
        else if (type === 'practice exam') { icon = 'quiz'; }
        
        const thumbMap = {
          'ebook': '/thumb_food_safety.png',
          'document': '/thumb_food_safety.png',
          'video': '/thumb_culinary.png',
          'podcast': '/thumb_culinary.png',
          'flashcard': '/thumb_haccp.png',
          'practice exam': '/thumb_practice_exam.png',
        };
        const thumbFallbacks = ['/thumb_food_safety.png', '/thumb_haccp.png', '/thumb_allergen.png', '/thumb_culinary.png', '/thumb_practice_exam.png'];
        const thumb = m.thumb || thumbMap[type] || thumbFallbacks[i % thumbFallbacks.length];

        return `
          <div class="card" style="padding:0; overflow:hidden; display:flex; flex-direction:column; position:relative; border:1px solid var(--border-light); transition:transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow-lg)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow=''">
            <img src="${thumb}" style="width:100%; height:140px; object-fit:cover; border-bottom:1px solid var(--border-light); cursor:pointer;" alt="Thumbnail" onclick="v3App.openHubMaterialDetail('${encodeURIComponent(m.title).replace(/'/g, '%27')}')">
            <div style="padding:20px; display:flex; flex-direction:column; flex:1;">
              <div style="font-size:18px; font-weight:700; color:var(--text-primary); margin-bottom:6px; line-height:1.3; cursor:pointer;" onclick="v3App.openHubMaterialDetail('${encodeURIComponent(m.title).replace(/'/g, '%27')}')">${m.title}</div>
              <div style="font-size:13px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; margin-bottom:16px;">
                <i class="material-icons-outlined" style="font-size:16px;">${icon}</i> 
                ${m.type || 'Ebook'} • ${m.duration || '120 mins'}
              </div>
              
              <div style="display:flex; justify-content:space-between; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid var(--border-light);">
                <div style="display:flex; flex-direction:column;">
                  <span style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-tertiary);">Assigned</span>
                  <span style="font-weight:600;">${Math.floor(Math.random()*20+5)}</span>
                </div>
                <div style="display:flex; flex-direction:column; text-align:right;">
                  <span style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-tertiary);">Avg. Complete</span>
                  <span style="font-weight:600; color:var(--brand-primary);">${Math.floor(Math.random()*40+50)}%</span>
                </div>
              </div>
              <button class="btn btn-secondary" style="width:100%; margin-top:auto;" onclick="v3App.openGlobalMaterialManageDrawer('${encodeURIComponent(m.title).replace(/'/g, '%27')}', '${m.type || 'Ebook'}', '${m.duration || '60 mins'}', '${thumb}')">${ctaText}</button>
            </div>
          </div>
        `;
      }).join('');
    } else if (tbody) {
      tbody.innerHTML = this.state.materials.map((m, i) => {
        const type = (m.type || 'Ebook').toLowerCase();
        let icon = 'menu_book';
        let ctaText = 'Manage';
        if (type === 'video') { icon = 'play_circle'; }
        else if (type === 'podcast') { icon = 'mic'; }
        else if (type === 'flashcard') { icon = 'style'; }
        else if (type === 'practice exam') { icon = 'quiz'; }
        
        const thumbMap = {
          'ebook': '/thumb_food_safety.png',
          'document': '/thumb_food_safety.png',
          'video': '/thumb_culinary.png',
          'podcast': '/thumb_culinary.png',
          'flashcard': '/thumb_haccp.png',
          'practice exam': '/thumb_practice_exam.png',
        };
        const thumbFallbacks = ['/thumb_food_safety.png', '/thumb_haccp.png', '/thumb_allergen.png', '/thumb_culinary.png', '/thumb_practice_exam.png'];
        const thumb = m.thumb || thumbMap[type] || thumbFallbacks[i % thumbFallbacks.length];

        return `
          <tr>
            <td style="width: 60px;">
              <img src="${thumb}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;">
            </td>
            <td style="font-weight:600;">${m.title}</td>
            <td>
              <div style="display:flex; align-items:center; gap:6px;">
                <i class="material-icons-outlined" style="font-size:16px;">${icon}</i> 
                ${m.type || 'Ebook'}
              </div>
            </td>
            <td>${m.duration || '120 mins'}</td>
            <td>${Math.floor(Math.random()*20+5)}</td>
            <td style="font-weight:600; color:var(--brand-primary);">${Math.floor(Math.random()*40+50)}%</td>
            <td>
               <button class="btn btn-secondary" style="padding:4px 12px; font-size:12px;" onclick="v3App.openGlobalMaterialManageDrawer('${encodeURIComponent(m.title).replace(/'/g, '%27')}', '${m.type || 'Ebook'}', '${m.duration || '60 mins'}', '${thumb}')">
                 ${ctaText}
               </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  },

  // ==========================================================================
  // MONITORING RENDERING
  // ==========================================================================
  
  renderMonitoring(filter = 'all') {
    const tbody = document.getElementById('monitor-tbody');
    const select = document.getElementById('monitor-session-select');
    const alertFeed = document.getElementById('monitor-alert-feed');
    const alertCount = document.getElementById('monitor-alert-count');
    
    if (!tbody) return;

    // Use exact same data as the rest of the application
    this.state.monitorState.session = { id: 'class_live_01', name: 'Active Live Class (Default)' };
    
    // Add mock monitoring properties to candidates if they don't have them
    this.state.monitorState.candidates = this.state.candidates.map(c => {
      let totalQ = 50;
      let attemptedQ = c.attemptedQ !== undefined ? c.attemptedQ : Math.floor(Math.random() * totalQ);
      let currentQ = attemptedQ + 1 > totalQ ? totalQ : attemptedQ + 1;
      let progressPercent = Math.round((attemptedQ / totalQ) * 100);
      return {
        ...c,
        timeRemaining: c.timeRemaining || (Math.floor(Math.random() * 90) + 30) * 60,
        aiRisk: c.aiRisk || (Math.random() > 0.8 ? 'red' : Math.random() > 0.5 ? 'amber' : 'clear'),
        totalQ,
        attemptedQ,
        currentQ,
        progressPercent
      };
    });

    // Mock some alerts based on high risk candidates
    const highRisk = this.state.monitorState.candidates.filter(c => c.aiRisk === 'red');
    this.state.monitorState.alerts = highRisk.map(c => ({
      candidateName: c.name,
      timestamp: new Date().toISOString(),
      alertType: 'Multiple Faces Detected / Audio Anomaly',
      message: 'System flagged suspicious activity.'
    }));

    this.renderMonitoringCandidates(filter);
    this.renderMonitoringAlerts(this.state.monitorState.alerts);
  },

  renderMonitoringCandidates(filter) {
    const tbody = document.getElementById('monitor-tbody');
    const select = document.getElementById('monitor-session-select');
    
    if (!tbody || !this.state.monitorState.session) return;
    
    // Update session select
    if (select && select.children.length <= 1) {
       select.innerHTML = `<option value="${this.state.monitorState.session.id}">${this.state.monitorState.session.name}</option>`;
    }

    let activeCandidates = this.state.monitorState.candidates;
    if (filter !== 'all') {
      activeCandidates = activeCandidates.filter(c => c.aiRisk === filter);
    }

    if (activeCandidates.length === 0) {
       tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--text-secondary);">No active candidates match this filter.</td></tr>`;
    } else {
       tbody.innerHTML = activeCandidates.map(c => {
         let riskChip = '';
         if (c.aiRisk === 'red') riskChip = '<span class="badge" style="background:var(--status-error-bg); color:var(--status-error);"><i class="material-icons" style="font-size:12px; margin-right:4px;">warning</i> High Risk</span>';
         else if (c.aiRisk === 'amber') riskChip = '<span class="badge" style="background:var(--status-warning-bg); color:var(--status-warning);">Medium Risk</span>';
         else riskChip = '<span class="badge" style="background:var(--status-success-bg); color:var(--status-success);">Clear</span>';

         let timeMins = Math.floor(c.timeRemaining / 60);

         return `
          <tr style="animation: fadeSlideUp 0.3s ease-out;">
            <td>
              <div style="display:flex; align-items:center; gap:12px;">
                <img src="${c.photo || 'https://via.placeholder.com/150'}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
                <div>
                  <div style="font-weight:600; font-size:14px;">${c.name}</div>
                  <div style="font-size:12px; color:var(--text-secondary);">${c.rollNo || c.id}</div>
                </div>
              </div>
            </td>
            <td style="font-weight:600; font-variant-numeric: tabular-nums;">${timeMins}:00</td>
            <td>
              <div style="display:flex; flex-direction:column; gap:4px; width:100px;">
                <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:600; color:var(--text-secondary);">
                  <span>Q${c.currentQ}</span>
                  <span>${c.attemptedQ}/${c.totalQ}</span>
                </div>
                <div style="width:100%; height:4px; background:var(--border-light); border-radius:2px; overflow:hidden;">
                  <div style="width:${c.progressPercent}%; height:100%; background:var(--brand-primary); border-radius:2px;"></div>
                </div>
              </div>
            </td>
            <td>${riskChip}</td>
            <td>
              <div style="display:flex; gap:8px;">
                <div style="width:40px; height:30px; background:var(--bg-color); border-radius:4px; display:flex; align-items:center; justify-content:center; color:${c.aiRisk === 'red' ? 'var(--status-error)' : (c.aiRisk === 'amber' ? 'var(--status-warning)' : 'var(--status-success)')};"><i class="material-icons-outlined" style="font-size:16px;">videocam</i></div>
                <div style="width:40px; height:30px; background:var(--bg-color); border-radius:4px; display:flex; align-items:center; justify-content:center; color:${c.aiRisk === 'red' ? 'var(--status-error)' : (c.aiRisk === 'amber' ? 'var(--status-warning)' : 'var(--status-success)')};"><i class="material-icons-outlined" style="font-size:16px;">desktop_windows</i></div>
              </div>
            </td>
            <td>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-secondary" style="padding:6px 12px; font-size:12px; color:var(--text-primary); border:1px solid var(--border-color); background:var(--surface-color); box-shadow:0 1px 2px rgba(0,0,0,0.05);" onclick="v3App.openSessionSupervisor('${c.id}')"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">settings</i> Take Action</button>
              </div>
            </td>
          </tr>
         `;
       }).join('');
    }
  },

  renderMonitoringAlerts(alerts) {
    this.state.monitorState.alerts = alerts;
    const alertFeed = document.getElementById('monitor-alert-feed');
    const alertCount = document.getElementById('monitor-alert-count');
    if (!alertFeed || !alertCount) return;

    alertCount.textContent = alerts.length;
    
    if (alerts.length === 0) {
      alertFeed.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">No active alerts.</div>';
      return;
    }

    alertFeed.innerHTML = alerts.map(a => `
      <div style="background:var(--bg-color); border-left:3px solid var(--status-error); border-radius:4px; padding:12px; animation: fadeSlideUp 0.3s ease-out;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <strong style="font-size:13px; color:var(--text-primary);">${a.candidateName}</strong>
          <span style="font-size:11px; color:var(--text-tertiary);">${new Date(a.timestamp).toLocaleTimeString()}</span>
        </div>
        <div style="font-size:12px; color:var(--text-secondary);">${a.alertType || a.message}</div>
      </div>
    `).join('');
  },

  filterMonitoring(type) {
    document.querySelectorAll('#monitor-filters .badge').forEach(b => {
      b.style.opacity = '0.5';
    });
    event.currentTarget.style.opacity = '1';
    this.renderMonitoring(type);
  },

  // ==========================================================================
  // EARNINGS RENDERING
  // ==========================================================================
  renderEarnings() {
    const data = this.state.earnings;
    if (!data) return;

    const kpis = document.getElementById('earnings-kpis');
    if (kpis) {
      kpis.innerHTML = `
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Total Earned This Month</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:var(--brand-primary);">$${data.summary.totalEarnedThisMonth || 0}</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Classes Completed</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px;">${data.summary.sessionsCompleted || 0}</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Pending Payout</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:var(--status-warning);">$${data.summary.pendingPayout || 0}</div>
        </div>
      `;
    }

    const sessionsTbody = document.getElementById('earnings-sessions-tbody');
    if (sessionsTbody && data.sessions) {
      sessionsTbody.innerHTML = data.sessions.map(s => `
        <tr>
          <td><div style="font-weight:600;">${s.sessionName}</div></td>
          <td>${s.date}</td>
          <td>${s.duration}</td>
          <td><strong style="color:var(--brand-primary);">$${s.amount}</strong></td>
          <td>${s.payoutStatus === 'paid' ? '<span class="badge badge-success">Paid</span>' : '<span class="badge badge-warning">Pending</span>'}</td>
        </tr>
      `).join('');
    }

    const payoutsTbody = document.getElementById('earnings-payouts-tbody');
    if (payoutsTbody && data.payouts) {
      payoutsTbody.innerHTML = data.payouts.map(p => `
        <tr>
          <td>${p.date}</td>
          <td><strong style="color:var(--status-success);">$${p.amount}</strong></td>
          <td><div style="display:flex; align-items:center; gap:8px;"><i class="material-icons-outlined" style="font-size:16px;">account_balance</i> ${p.method}</div></td>
          <td><span class="badge badge-success">${p.status.toUpperCase()}</span></td>
        </tr>
      `).join('');
    }
  },

  // ==========================================================================
  // REPORTS RENDERING
  // ==========================================================================
  renderReports() {
    const data = this.state.reports;
    if (!data) return;

    const kpis = document.getElementById('reports-kpis');
    if (kpis) {
      kpis.innerHTML = `
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Completed Exams</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px;">${data.overview.completedSessions || 0}</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Overall Pass Rate</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:var(--status-success);">${data.overview.passRate || 0}%</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Total AI Flags</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:var(--status-warning);">${data.aiStats.totalFlags || 0}</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">AI Accuracy</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:var(--brand-primary);">${data.aiStats.accuracyRate || 0}%</div>
        </div>
      `;
    }

    const sessTbody = document.getElementById('reports-sessions-tbody');
    if (sessTbody && data.sessionBreakdown) {
      sessTbody.innerHTML = data.sessionBreakdown.map(s => `
        <tr>
          <td><div style="font-weight:600;">${s.name}</div></td>
          <td>${new Date(s.examDate).toLocaleDateString()}</td>
          <td>${s.candidateCount}</td>
          <td>${s.incidentCount > 0 ? `<span style="color:var(--status-error); font-weight:600;">${s.incidentCount}</span>` : '0'}</td>
          <td><span class="badge ${s.status === 'completed' ? 'badge-success' : 'badge-info'}">${s.status.toUpperCase()}</span></td>
        </tr>
      `).join('');
    }

    const aiStats = document.getElementById('reports-ai-stats');
    if (aiStats && data.aiStats) {
      aiStats.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--bg-color); border:1px solid var(--border-color); border-radius:8px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:12px; height:12px; background:var(--status-success); border-radius:50%;"></div>
              <span style="font-size:14px; font-weight:500;">Dismissed (False Positives)</span>
            </div>
            <strong style="font-size:16px;">${data.aiStats.dismissed}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--bg-color); border:1px solid var(--border-color); border-radius:8px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:12px; height:12px; background:var(--status-error); border-radius:50%;"></div>
              <span style="font-size:14px; font-weight:500;">Escalated (Violations)</span>
            </div>
            <strong style="font-size:16px;">${data.aiStats.escalated}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--bg-color); border:1px solid var(--border-color); border-radius:8px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:12px; height:12px; background:var(--status-warning); border-radius:50%;"></div>
              <span style="font-size:14px; font-weight:500;">Pending Review</span>
            </div>
            <strong style="font-size:16px;">${data.aiStats.pending}</strong>
          </div>
        </div>
      `;
    }
  },

  // ==========================================================================
  // SETTINGS RENDERING
  // ==========================================================================
  renderSettings() {
    const data = this.state.settings;
    if (!data) return;

    const profileForm = document.getElementById('settings-profile-form');
    if (profileForm) {
      profileForm.innerHTML = `
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:24px;">
          <img src="${data.avatar || 'https://via.placeholder.com/150'}" style="width:64px; height:64px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color);">
          <button class="btn btn-secondary" style="padding:6px 12px; font-size:13px;">Change Photo</button>
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Full Name</label>
          <input type="text" value="${data.name}" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);">
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Email Address</label>
          <input type="email" value="${data.email}" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" disabled>
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Phone Number</label>
          <input type="text" value="${data.phone || ''}" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);">
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Organization</label>
          <input type="text" value="${data.organization}" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" disabled>
        </div>
        <button class="btn btn-primary" onclick="v3App.showToast('Profile updated.', 'success')">Save Profile</button>
      `;
    }

    const securityForm = document.getElementById('settings-security-form');
    if (securityForm) {
      securityForm.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; padding:16px; background:var(--bg-color); border:1px solid var(--border-color); border-radius:8px;">
          <div>
            <div style="font-weight:600; font-size:14px; margin-bottom:4px;">Two-Factor Authentication</div>
            <div style="font-size:12px; color:var(--text-secondary);">Secure your account with 2FA.</div>
          </div>
          <button class="btn ${data.twoFactorEnabled ? 'btn-danger' : 'btn-primary'}" style="padding:6px 12px; font-size:12px;" onclick="v3App.showToast('2FA settings changed.', 'success')">${data.twoFactorEnabled ? 'Disable' : 'Enable'}</button>
        </div>

        <h4 style="font-size:14px; font-weight:600; margin-bottom:12px;">Notification Preferences</h4>
        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
            <input type="checkbox" ${data.notifications?.email ? 'checked' : ''}> Email Notifications
          </label>
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
            <input type="checkbox" ${data.notifications?.sms ? 'checked' : ''}> SMS Alerts for AI Flags
          </label>
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
            <input type="checkbox" ${data.notifications?.push ? 'checked' : ''}> Browser Push Notifications
          </label>
        </div>
        
        <button class="btn btn-primary" onclick="v3App.showToast('Preferences saved.', 'success')">Save Preferences</button>
      `;
    }
  },

  // ==========================================================================
  // PROCTOR RESOURCES PANEL (policies, signed agreements, support)
  // ==========================================================================
  openProctorResources(section) {
    const panel = document.getElementById('proctor-resources-panel');
    const overlay = document.getElementById('pr-overlay');
    if (!panel || !overlay) return;
    this.renderProctorResources();
    overlay.classList.add('open');
    panel.classList.add('open');
    if (section) {
      setTimeout(() => {
        const el = document.getElementById('pr-' + section);
        if (el) { el.setAttribute('open', ''); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }, 320);
    }
  },

  closeProctorResources() {
    const panel = document.getElementById('proctor-resources-panel');
    const overlay = document.getElementById('pr-overlay');
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  },

  renderProctorResources() {
    const box = document.getElementById('pr-content');
    if (!box) return;
    const signer = (this.state.settings && this.state.settings.name) || 'You';
    const signedDate = 'May 18, 2026'; // demo signature stamp
    box.innerHTML = `
      <!-- Policy Manual -->
      <details class="pr-acc" id="pr-manual" open>
        <summary><i class="material-icons-outlined" style="color:var(--brand-primary);">menu_book</i> Proctor Policy Manual <i class="material-icons-outlined pr-chevron">expand_more</i></summary>
        <div class="pr-acc-body">
          <h5>1. Impartiality &amp; Integrity</h5>
          Remain neutral at all times. You may not proctor an exam where you have guaranteed a result or have a personal stake in any candidate's outcome.
          <h5>2. Identity Verification</h5>
          Verify every candidate with a physical, current, government-issued photo ID before admission. Photocopies and digital photos are never acceptable.
          <h5>3. During the Exam</h5>
          The standard allowance is two hours. Only one candidate may step away at a time; the examination clock does not stop for breaks.
          <h5>4. Misconduct</h5>
          On suspected misconduct, calmly and quietly direct the candidate to stop testing, secure the exam, collect prohibited materials, and document everything.
          <h5>5. Emergencies</h5>
          In a fire alarm or severe weather, the safety of all candidates comes first. Secure exam content once everyone is safe and log it as an irregularity.
          <div style="margin-top:14px;"><button class="btn btn-secondary" style="font-size:13px; padding:8px 14px;" onclick="v3App.showToast('Opening full policy manual (PDF)…','info')"><i class="material-icons-outlined" style="font-size:16px;">download</i> Download full manual (PDF)</button></div>
        </div>
      </details>

      <!-- Signed NDA & Service Agreement -->
      <details class="pr-acc" id="pr-agreements">
        <summary><i class="material-icons-outlined" style="color:var(--brand-primary);">draw</i> Signed NDA &amp; Service Agreement <i class="material-icons-outlined pr-chevron">expand_more</i></summary>
        <div class="pr-acc-body">
          <div class="pr-signed-banner">
            <i class="material-icons-outlined" style="color:var(--status-success); font-size:18px;">verified</i>
            <span>Signed on <strong>${signedDate}</strong> by <strong>${signer}</strong> during onboarding. The agreements below are the versions you accepted.</span>
          </div>
          <h5>Non-Disclosure Agreement</h5>
          You have access to candidate PII, exam content, and screen recordings. You agree to keep all such information strictly confidential and to use it solely for proctoring duties on the SecureProctor platform. You will not copy, distribute, publish, or disclose any exam materials, candidate data, or recordings to any third party. This obligation survives termination of your certification.
          <h5>Service Agreement</h5>
          As a certified SDC proctor you agree to conduct assigned examinations in accordance with SDC policies, maintain examination integrity, complete required training, and renew your authorization every three years. Compensation, scheduling, and conduct standards are governed by this agreement; violations may result in suspension or revocation of your proctor authorization.
          <div style="margin-top:14px;"><button class="btn btn-secondary" style="font-size:13px; padding:8px 14px;" onclick="v3App.showToast('Downloading your signed copies…','info')"><i class="material-icons-outlined" style="font-size:16px;">download</i> Download signed copies</button></div>
        </div>
      </details>

      <!-- Contact SDC -->
      <details class="pr-acc" id="pr-contact">
        <summary><i class="material-icons-outlined" style="color:var(--brand-primary);">contact_support</i> Contact SDC <i class="material-icons-outlined pr-chevron">expand_more</i></summary>
        <div class="pr-acc-body">
          <div class="pr-contact-row"><i class="material-icons-outlined">email</i> <a href="mailto:proctors@sdccertifications.com" style="color:var(--brand-primary); text-decoration:none;">proctors@sdccertifications.com</a></div>
          <div class="pr-contact-row"><i class="material-icons-outlined">call</i> +1 (800) 555-7732</div>
          <div class="pr-contact-row"><i class="material-icons-outlined">schedule</i> Mon–Fri, 8:00 AM – 6:00 PM ET</div>
          <div class="pr-contact-row"><i class="material-icons-outlined">place</i> SDC Certifications, 200 Culinary Ave, Suite 400, Chicago, IL</div>
        </div>
      </details>

      <!-- Report a policy issue -->
      <details class="pr-acc" id="pr-report">
        <summary><i class="material-icons-outlined" style="color:var(--status-error);">flag</i> Report a Policy Issue / Violation <i class="material-icons-outlined pr-chevron">expand_more</i></summary>
        <div class="pr-acc-body">
          <p style="margin-bottom:12px;">Report a policy concern or suspected violation directly to SDC. Reports are confidential.</p>
          <div class="form-group mb-4">
            <label style="display:block; margin-bottom:6px; font-size:13px; font-weight:600; color:var(--text-primary);">Category</label>
            <select id="pr-report-cat" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);">
              <option>Exam integrity concern</option>
              <option>Candidate misconduct</option>
              <option>Conflict of interest</option>
              <option>Platform / technical policy issue</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-group mb-4">
            <label style="display:block; margin-bottom:6px; font-size:13px; font-weight:600; color:var(--text-primary);">Description</label>
            <textarea id="pr-report-desc" rows="4" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color); resize:vertical;" placeholder="Describe the issue, including class/candidate if relevant…"></textarea>
          </div>
          <button class="btn btn-primary" style="width:100%; justify-content:center; background:var(--status-error); border-color:var(--status-error);" onclick="v3App.submitPolicyReport()"><i class="material-icons-outlined" style="font-size:18px;">send</i> Submit Report to SDC</button>
        </div>
      </details>
    `;
  },

  submitPolicyReport() {
    const cat = (document.getElementById('pr-report-cat') || {}).value || '';
    const desc = ((document.getElementById('pr-report-desc') || {}).value || '').trim();
    if (!desc) { this.showToast('Please describe the issue before submitting.', 'error'); return; }
    const descEl = document.getElementById('pr-report-desc'); if (descEl) descEl.value = '';
    this.showToast(`Report submitted to SDC (${cat}). Reference #SDC-${Math.floor(Math.random()*90000+10000)}.`, 'success');
    this.closeProctorResources();
  },

  // ==========================================================================
  // DRAWER & ACTIONS
  // ==========================================================================
  openFormDrawer(type, contextId = null) {
    document.getElementById('drawer-subtitle').textContent = 'Create New Record';
    document.getElementById('drawer-action-btn').style.display = 'block';
    const content = document.getElementById('drawer-content');
    
    if (type === 'candidate') {
      document.getElementById('drawer-title').textContent = 'Add Candidate';
      document.getElementById('drawer-subtitle').textContent = 'Find an existing student or add a new one';
      this._acMode = 'existing';
      this._acSelectedId = null;
      const inputStyle = 'width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);';
      const classOpts = (this.state.sessions || [])
        .map(s => `<option value="${s.id}">${s.name}</option>`).join('');
      content.innerHTML = `
        <!-- Mode toggle -->
        <div style="display:flex; gap:8px; margin-bottom:20px;">
          <button type="button" class="filter-chip active" id="acm-existing" onclick="v3App.setAddCandidateMode('existing')">
            <i class="material-icons-outlined" style="font-size:16px;">person_search</i> Existing student
          </button>
          <button type="button" class="filter-chip" id="acm-new" onclick="v3App.setAddCandidateMode('new')">
            <i class="material-icons-outlined" style="font-size:16px;">person_add</i> New student
          </button>
        </div>

        <!-- EXISTING: find in directory -->
        <div id="ac-existing-block">
          <div class="form-group mb-4">
            <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Find student in directory</label>
            <input type="text" id="ac-search" style="${inputStyle}" placeholder="Search by name, email or ID…" oninput="v3App.searchDirectory(this.value)" autocomplete="off">
          </div>
          <div id="ac-results" style="max-height:240px; overflow-y:auto; border:1px solid var(--border-color); border-radius:8px; margin-bottom:16px;"></div>
        </div>

        <!-- NEW: create + save to directory -->
        <div id="ac-new-block" style="display:none;">
          <div class="form-group mb-4">
            <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Full Name</label>
            <input type="text" id="form-name" style="${inputStyle}" placeholder="e.g. John Doe">
          </div>
          <div class="form-group mb-4">
            <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Email Address</label>
            <input type="email" id="form-email" style="${inputStyle}" placeholder="e.g. john@example.com">
          </div>
          <div class="form-group mb-4">
            <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Candidate ID</label>
            <input type="text" id="form-roll" style="${inputStyle}" placeholder="e.g. CS-2026-001">
          </div>
          <div style="display:flex; gap:10px; align-items:flex-start; padding:12px; border-radius:8px; background:rgba(0,99,155,0.08); border:1px solid rgba(0,99,155,0.2); margin-bottom:16px;">
            <i class="material-icons-outlined" style="font-size:18px; color:var(--inf);">info</i>
            <span style="font-size:12px; color:var(--text-secondary);">This is a new student — they'll also be saved to the <strong>Candidate Directory</strong> for future classes.</span>
          </div>
        </div>

        <!-- Shared: assign to class (hidden when opened from inside a class) -->
        <div class="form-group mb-4" id="ac-class-group">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Add to Class</label>
          <select id="ac-class" style="${inputStyle}">
            <option value="">— No class yet —</option>
            ${classOpts}
          </select>
        </div>
      `;
      this.searchDirectory('');
      // When launched from a specific class (Session Detail), the class is already
      // known — preselect it and hide the dropdown (Task 6).
      if (contextId) {
        const sel = document.getElementById('ac-class');
        if (sel) sel.value = contextId;
        const grp = document.getElementById('ac-class-group');
        if (grp) grp.style.display = 'none';
        const sess = (this.state.sessions || []).find(s => s.id === contextId);
        if (sess) document.getElementById('drawer-subtitle').textContent = `Adding to ${sess.name}`;
      }
      document.getElementById('drawer-action-btn').textContent = 'Add to Class';
      document.getElementById('drawer-action-btn').onclick = () => this.submitAddCandidate();

    } else if (type === 'session') {
      document.getElementById('drawer-title').textContent = 'Add Class';
      const assessmentOpts = this.examAssessments
        .map(a => `<option value="${a.id}">${a.name}</option>`).join('');
      content.innerHTML = `
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Class Name</label>
          <input type="text" id="form-s-name" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. Final Exams - Batch A">
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Exam Assessment</label>
          <select id="form-s-assessment" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" onchange="v3App.onExamAssessmentChange()">
            <option value="">— Select an assessment —</option>
            ${assessmentOpts}
          </select>
          <div id="form-s-voucher-info" style="display:none; margin-top:8px; padding:10px 12px; border-radius:6px; background:var(--status-success-bg); font-size:12px; color:var(--status-success); font-weight:600;">
            <i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">confirmation_number</i>
            <span id="form-s-voucher-count">0</span> Voucher Codes available for this assessment
          </div>
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Subject Duration (mins)</label>
          <input type="number" id="form-s-dur" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. 120" value="120">
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:12px; font-size:13px; font-weight:600; border-bottom:1px solid var(--border-light); padding-bottom:8px;">Exam Settings</label>
          <div style="display:flex; gap:16px; margin-bottom:16px;">
            <div style="flex:1">
              <label style="display:block; margin-bottom:4px; font-size:12px;">Date</label>
              <input type="date" id="form-s-date" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);">
            </div>
            <div style="flex:1">
              <label style="display:block; margin-bottom:4px; font-size:12px;">Time</label>
              <input type="time" id="form-s-time" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);">
            </div>
          </div>
          <div style="margin-bottom:16px;">
            <label style="display:block; margin-bottom:4px; font-size:12px;">Location</label>
            <input type="text" id="form-s-loc" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. Room 101 or Online">
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <label style="font-size:12px; font-weight:600;">Allow Retake</label>
            <label class="switch">
              <input type="checkbox" id="form-s-retake" onchange="v3App.toggleSessionRetake(this.checked)">
              <span class="switch-slider"></span>
            </label>
          </div>
          <div id="form-s-retake-options" style="display:none; margin:0 0 12px 0; padding:12px; border-radius:6px; background:var(--bg-color); border:1px solid var(--border-light); animation: fadeSlideUp 0.2s ease;">
            <label style="display:block; margin-bottom:4px; font-size:12px;">Maximum Attempts</label>
            <select id="form-s-retake-max" style="width:100%; padding:8px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color); font-size:12px; margin-bottom:12px;">
              <option value="2">2 attempts</option>
              <option value="3">3 attempts</option>
              <option value="unlimited">Unlimited</option>
            </select>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label style="font-size:12px;">Charge a retake fee</label>
              <label class="switch">
                <input type="checkbox" id="form-s-retake-fee">
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <label style="font-size:12px; font-weight:600;">Allow Online Exam</label>
            <label class="switch">
              <input type="checkbox" id="form-s-online" onchange="document.getElementById('form-s-online-fees').style.display = this.checked ? 'block' : 'none'">
              <span class="switch-slider"></span>
            </label>
          </div>
          <div id="form-s-online-fees" style="display:none; margin-bottom:12px; animation: fadeSlideUp 0.2s ease;">
            <label style="display:block; margin-bottom:4px; font-size:12px;">Online fees to be paid by</label>
            <select style="width:100%; padding:8px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color); font-size:12px;">
              <option>Organization</option>
              <option>Candidate</option>
            </select>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <label style="font-size:12px; font-weight:600;">Sponsored by Organization</label>
            <label class="switch">
              <input type="checkbox" id="form-s-sponsored">
              <span class="switch-slider"></span>
            </label>
          </div>
        </div>
      `;
      // Ensure retake options start hidden/disabled until "Allow Retake" is on (Task 7).
      this.toggleSessionRetake(false);
      document.getElementById('drawer-action-btn').textContent = 'Save as Draft';
      document.getElementById('drawer-action-btn').onclick = () => {
        const name = document.getElementById('form-s-name').value;
        if (!name) { this.showToast('Class name is required.', 'error'); return; }
        const assessmentId = document.getElementById('form-s-assessment').value;
        const assessment = this.examAssessments.find(a => a.id === assessmentId);
        const retakeOn = document.getElementById('form-s-retake').checked;
        this.state.sessions.unshift({
          id: 'sess_' + Math.random().toString(36).substr(2, 9),
          name: name,
          assessment: assessment ? assessment.name : null,
          examDate: document.getElementById('form-s-date').value || new Date().toISOString(),
          examTime: document.getElementById('form-s-time').value || '',
          location: document.getElementById('form-s-loc').value || '',
          duration: document.getElementById('form-s-dur').value || 60,
          allowRetake: retakeOn,
          retakeMax: retakeOn ? document.getElementById('form-s-retake-max').value : null,
          retakeFee: retakeOn ? document.getElementById('form-s-retake-fee').checked : false,
          allowOnline: document.getElementById('form-s-online').checked,
          sponsored: document.getElementById('form-s-sponsored').checked,
          status: 'draft',
          candidates: 0,
          readiness: 0
        });
        this.renderSessions('all');
        this.closeDrawer();
        this.showToast('Class saved as Draft.', 'success');
      };

    } else if (type === 'material') {
      document.getElementById('drawer-title').textContent = 'Upload Learning Material';
      content.innerHTML = `
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">File Upload</label>
          <div style="border:2px dashed var(--brand-primary); padding:40px; text-align:center; border-radius:8px; background:var(--brand-active); cursor:pointer;">
             <i class="material-icons-outlined" style="font-size:32px; color:var(--brand-primary);">cloud_upload</i>
             <div style="margin-top:8px; font-weight:600; color:var(--brand-primary);">Click to browse files</div>
          </div>
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Material Title</label>
          <input type="text" id="form-m-title" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. Module 3 Handbook">
        </div>
      `;
      document.getElementById('drawer-action-btn').textContent = 'Upload File';
      document.getElementById('drawer-action-btn').onclick = () => {
        const tbody = document.getElementById('materials-tbody');
        if (tbody.innerHTML.includes('No learning materials')) tbody.innerHTML = '';
        
        tbody.innerHTML += `
          <tr>
            <td><input type="checkbox"></td>
            <td><strong>${document.getElementById('form-m-title').value || 'Untitled.pdf'}</strong></td>
            <td><span class="badge" style="background:var(--status-warning-bg); color:var(--status-warning);">PDF</span></td>
            <td>0 Classes</td>
            <td><span class="badge badge-success">Processed</span></td>
            <td><button class="btn btn-secondary" style="padding:4px 12px; font-size:12px;">View</button></td>
          </tr>
        `;
        this.closeDrawer();
        this.showToast('File successfully uploaded and processed.', 'success');
      };
    }

    document.getElementById('drawer-overlay').classList.add('open');
    document.getElementById('universal-drawer').classList.add('open');
  },

  openCandidateDrawer(id) {
    const cand = this.state.candidates.find(c => c.id === id);
    if (!cand) return;

    document.getElementById('drawer-title').textContent = cand.name;
    document.getElementById('drawer-subtitle').textContent = `ID: ${cand.rollNo || cand.id}`;

    let voucherState = cand.voucherStatus || 'unassigned'; 
    if (voucherState === 'not_assigned') voucherState = 'unassigned';
    let classStatus = cand.examStatus || 'enrolled'; 
    if (classStatus === 'session_scheduled') classStatus = 'enrolled';

    let scenario = 4;
    if ((voucherState === 'redeemed' || voucherState === 'activated') && classStatus === 'completed') scenario = 1;
    else if ((voucherState === 'redeemed' || voucherState === 'activated') && (classStatus === 'in_progress' || classStatus === 'active')) scenario = 2;
    else if ((voucherState === 'assigned' || voucherState === 'pending') && classStatus === 'enrolled') scenario = 3;
    else scenario = 4;

    let contentHtml = `
      <div style="background:var(--bg-color); padding:16px; border-radius:8px; display:flex; align-items:center; gap:16px; margin-bottom:20px; border:1px solid var(--border-color);">
        <img src="${cand.photo || 'https://via.placeholder.com/150'}" style="width:56px; height:56px; border-radius:50%; object-fit:cover; border:2px solid var(--brand-primary);">
        <div>
          <h3 style="margin:0 0 4px 0; font-size:16px; color:var(--text-primary);">${cand.name}</h3>
          <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">email</i> ${cand.email}</div>
          <div style="font-size:12px; color:var(--text-secondary);"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">badge</i> Candidate ID: ${cand.rollNo || 'N/A'}</div>
        </div>
      </div>
      
      <div style="border:1px solid var(--border-color); padding:16px; border-radius:8px; margin-bottom:20px;">
        <h4 style="margin:0 0 12px 0; font-size:13px; color:var(--text-primary);">Accommodations</h4>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; margin-bottom:12px; cursor:pointer; color:var(--text-primary);">
          <input type="checkbox" id="acc-checkbox" onchange="document.getElementById('acc-notes').disabled = !this.checked">
          Accommodations Applied
        </label>
        <div class="form-group mb-0">
          <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600; color:var(--text-secondary);">Conditions & Reasons</label>
          <textarea id="acc-notes" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-primary); resize:vertical; min-height:60px;" disabled placeholder="Enter specific accommodation details..."></textarea>
        </div>
      </div>
      
      <div style="border:1px solid var(--border-color); padding:16px; border-radius:8px; margin-bottom:20px;">
        <h4 style="margin:0 0 12px 0; font-size:13px; color:var(--text-primary);">Textbook Voucher Code</h4>
        <div class="form-group mb-0" style="display:flex; gap:8px;">
          <input type="text" id="textbook-voucher-code" placeholder="Enter textbook voucher code" style="flex:1; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-primary);">
          <button class="btn btn-secondary" onclick="
            const code = document.getElementById('textbook-voucher-code').value;
            if(code) {
              v3App.showToast('Textbook Voucher Code Applied. Pending voucher removed.', 'success');
              v3App.closeDrawer();
            } else {
              v3App.showToast('Please enter a code', 'error');
            }
          ">Apply</button>
        </div>
        <div style="font-size:11px; color:var(--text-secondary); margin-top:8px;">If the student presents a textbook voucher code, entering it here will remove their assigned/pending voucher.</div>
      </div>
    `;

    let scenarioContent = '';
    
    // Retake Logic Guard
    let retakeHtml = '';
    // Enrolled Class Guard: If enrolled (Scenario 0), retake logic is completely HIDDEN.
    if (scenario !== 0) {
      retakeHtml = `
        <div style="margin-top:16px; padding-top:16px; border-top:1px solid var(--border-light);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px; font-weight:600; color:var(--text-primary);">Retake Eligible</span>
            <label class="switch">
              <input type="checkbox" id="retake-toggle-${cand.id}" onchange="document.getElementById('exam-mode-block-${cand.id}').style.display = this.checked ? 'block' : 'none'">
              <span class="switch-slider"></span>
            </label>
          </div>
          <div id="exam-mode-block-${cand.id}" style="display:none; margin-top:12px; animation: fadeSlideUp 0.2s ease;">
            <div class="form-group mb-0">
              <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600; color:var(--text-secondary);">Exam Mode</label>
              <select style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-primary);">
                <option>In-Class</option>
                <option>Online</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }


    if (scenario === 1) {
      if (cand.examScore === undefined) {
         cand.examScore = Math.floor(Math.random() * 80) + 20; // Generate between 20 and 100 for proper pass/fail variance
      }
      const passed = cand.examScore > 50;
      
      scenarioContent = `
        <h4 style="margin:0 0 12px 0; font-size:13px; color:var(--text-primary);">Learning Summary</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; background:var(--bg-color); border:1px solid var(--border-color); padding:12px; border-radius:8px;">
          <div>
            <div style="font-size:11px; color:var(--text-secondary);">Exam Result</div>
            <div style="font-weight:600; color:${passed ? 'var(--status-success)' : 'var(--status-error)'};">${passed ? 'Passed' : 'Failed'}</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-secondary);">Score Obtained</div>
            <div style="font-weight:600; color:var(--text-primary);">${cand.examScore}%</div>
          </div>
        </div>
        ${passed ? `<div style="margin-top:12px;"><button class="btn btn-secondary" style="width:100%;" onclick="v3App.showToast('Certificate Downloaded', 'success')"><i class="material-icons-outlined">workspace_premium</i> Download Certificate</button></div>` : ''}
        ${retakeHtml}
        
        <div style="margin-top:24px; display:flex; gap:12px;">
          <button class="btn btn-primary" style="flex:2; background:var(--brand-primary); border-color:var(--brand-primary);" onclick="v3App.openSessionSupervisor('${cand.id}')"><i class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-right:4px;">settings</i> Take Action</button>
          <button class="btn btn-secondary" style="flex:1; color:var(--status-error); border-color:var(--status-error);" onclick="v3App.showToast('Account Deactivated', 'error'); v3App.closeDrawer();">Deactivate</button>
          <button class="btn btn-secondary" style="flex:1; color:var(--status-error); border-color:var(--status-error);" onclick="v3App.openDeleteCandidateModal('${cand.id}')">Remove</button>
        </div>
      `;
      document.getElementById('drawer-action-btn').style.display = 'none';
    } 
    else if (scenario === 2) {
      const examDateStr = cand.examDate ? new Date(cand.examDate).toLocaleDateString() : 'Pending Schedule';
      scenarioContent = `
        <h4 style="margin:0 0 12px 0; font-size:13px; color:var(--text-primary);">Current Class: <span style="font-weight:400; color:var(--text-secondary);">${cand.subject || 'N/A'}</span></h4>
        <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:12px; border-radius:8px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-secondary); margin-bottom:6px;">
            <span>Learning Progress</span>
            <span>${cand.learningProgress || 0}% Complete</span>
          </div>
          <div style="width:100%; height:6px; background:var(--border-light); border-radius:3px; overflow:hidden;">
            <div style="width:${cand.learningProgress || 0}%; height:100%; background:var(--brand-primary);"></div>
          </div>
        </div>
        <div style="font-size:13px; margin-bottom:4px; color:var(--text-primary);"><strong>Upcoming Exam Date:</strong> <span style="color:var(--text-secondary);">${examDateStr}</span></div>
        ${retakeHtml}

        <div style="margin-top:24px; display:flex; gap:12px;">
          <button class="btn btn-primary" style="flex:2; background:var(--brand-primary); border-color:var(--brand-primary);" onclick="v3App.openSessionSupervisor('${cand.id}')"><i class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-right:4px;">settings</i> Take Action</button>
          <button class="btn btn-secondary" style="flex:1; color:var(--status-error); border-color:var(--status-error);" onclick="v3App.showToast('Account Deactivated', 'error'); v3App.closeDrawer();">Deactivate</button>
          <button class="btn btn-secondary" style="flex:1; color:var(--status-error); border-color:var(--status-error);" onclick="v3App.openDeleteCandidateModal('${cand.id}')">Remove</button>
        </div>
      `;
      document.getElementById('drawer-action-btn').style.display = 'none';
    }
    else if (scenario === 3) {
      scenarioContent = `
        <div style="background:var(--status-warning-bg); border:1px solid var(--status-warning); padding:12px; border-radius:8px; margin-bottom:24px;">
          <div style="font-size:13px; font-weight:600; color:var(--status-warning); margin-bottom:4px;">Voucher Code State: Pending Redemption</div>
          <div style="font-size:12px; color:var(--status-warning);">Target Class: ${cand.subject || 'N/A'}</div>
        </div>
        
        <div style="margin-top:24px; display:flex; gap:12px;">
          <button class="btn btn-secondary" style="flex:1; color:var(--status-error); border-color:var(--status-error);" onclick="v3App.openDeleteCandidateModal('${cand.id}')">Remove Candidate</button>
          <button class="btn btn-primary" style="flex:1;" onclick="v3App.openRedeemVoucherModal('${cand.id}')">Redeem Voucher Code</button>
        </div>
      `;
      document.getElementById('drawer-action-btn').style.display = 'none';
    }
    else {
      scenarioContent = `
        <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:12px; border-radius:8px;">
          <div style="font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:4px;">Voucher Code State: No Voucher Code Linked</div>
          <div style="font-size:12px; color:var(--text-secondary);">Current Class: ${cand.subject || 'N/A'}</div>
        </div>
        ${retakeHtml}

        <div style="margin-top:24px; display:flex; gap:12px;">
          <button class="btn btn-secondary" style="flex:1; color:var(--status-error); border-color:var(--status-error);" onclick="v3App.openDeleteCandidateModal('${cand.id}')">Remove Candidate</button>
          <button class="btn btn-primary" style="flex:1;" onclick="v3App.showToast('Voucher Code Assigned', 'success'); v3App.closeDrawer();">Assign Voucher Code</button>
        </div>
      `;
      document.getElementById('drawer-action-btn').style.display = 'none';
    }

    document.getElementById('drawer-content').innerHTML = contentHtml + scenarioContent;
    
    document.getElementById('drawer-overlay').classList.add('open');
    document.getElementById('universal-drawer').classList.add('open');
  },


  viewCandidateHistory(candId) {
    const cand = this.state.candidates.find(c => c.id === candId);
    if (!cand) return;

    document.getElementById('drawer-subtitle').textContent = `Class History - ID: ${cand.rollNo || cand.id}`;
    const content = document.getElementById('drawer-content');
    content.innerHTML = `
      <div class="card" style="margin-bottom:16px; padding:0;">
        <table class="data-table">
          <thead><tr><th>Date</th><th>Score</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Oct 10, 2026</td><td>85%</td><td><span class="badge badge-success">Passed</span></td></tr>
            <tr><td>Sep 15, 2026</td><td>--</td><td><span class="badge badge-error">Failed</span></td></tr>
          </tbody>
        </table>
      </div>
      <button class="btn btn-secondary" style="width:100%;" onclick="v3App.openCandidateDrawer('${candId}')"><i class="material-icons-outlined">arrow_back</i> Back to Management</button>
    `;
  },

  suspendCandidate(id) {
    // Optimistic UI Update
    const cand = this.state.candidates.find(c => c.id === id);
    if (cand) cand.examStatus = 'suspended';
    this.closeDrawer();
    this.renderCandidates('all');
    this.showToast('Candidate account has been permanently deactivated.', 'success');
  },

  startSession(id) {
    const session = this.state.sessions.find(s => s.id === id);
    if (session) {
      session.status = 'ongoing';
      this.showToast('Class Started successfully.', 'success');
      this.renderSessions('all');
      this.openSessionDetail(id);
    }
  },

    switchDeepDiveTab(el, type) {
    document.querySelectorAll('#dd-tabs-container .dd-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const grid = document.getElementById('dd-cards-grid');
    if (grid) {
      grid.style.opacity = '0';
      grid.style.transform = 'translateY(8px)';
      setTimeout(() => {
        grid.style.transition = 'opacity 0.3s, transform 0.3s';
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
      }, 150);
    }
    v3App.showToast('Showing ' + type.charAt(0).toUpperCase() + type.slice(1) + ' materials', 'info');
  },

  openLearningDeepDive(candidateId, candName, className, globalProg) {
    document.getElementById('view-session-detail').style.display = 'none';
    const dd = document.getElementById('view-learning-deepdive');
    if(dd) dd.style.display = 'block';
    this.state.currentView = 'learning-deepdive';
    
    const nameEl = document.getElementById('dd-cand-name');
    if(nameEl) nameEl.textContent = candName || 'Unknown Candidate';
    
    const classEl = document.getElementById('dd-cand-class');
    if(classEl) classEl.textContent = className || 'Ongoing Class';
    
    const progEl = document.getElementById('dd-cand-progval');
    if(progEl) progEl.textContent = (globalProg || 0) + '%';
    
    const grid = document.getElementById('dd-cards-grid');
    if(grid) {
      const ddCards = [
        { title: "The Food Protection Manager's Handbook (Study Guide)", time: '120 / 120 mins read', prog: 100, cta: 'Read', img: '/thumb_food_safety.png', state: 'completed' },
        { title: "The Food Protection Manager's Handbook Concise Edition", time: '45 / 60 mins read', prog: 75, cta: 'Resume', img: '/thumb_haccp.png', state: 'progress' },
        { title: "The Food Protection Manager's Handbook A PODCAST SERIES", time: '0 / 180 mins listened', prog: 0, cta: 'Start Listening', img: '/thumb_culinary.png', state: 'disabled' },
        { title: 'SDC Certifications Practice Examination', time: '0 / 1 attempt', prog: 0, cta: 'Start Exam', img: '/thumb_practice_exam.png', state: 'not_started' },
      ];
      grid.innerHTML = ddCards.map((c, idx) => {
        const isDisabled = c.state === 'disabled';
        const delay = idx * 0.08;
        return `
          <div class="dd-card ${isDisabled ? 'disabled' : ''}" style="animation: ddFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both; ${isDisabled ? 'opacity:0.5;' : ''}">
            <img src="${c.img}" style="height:180px; width:100%; object-fit:cover; border-bottom:1px solid var(--border-color); ${isDisabled ? 'filter:grayscale(1);' : ''}" alt="${c.title}">
            <div style="padding:24px; display:flex; flex-direction:column; flex:1;">
              <div style="font-size:16px; font-weight:600; margin-bottom:8px; line-height:1.3;">${c.title}</div>
              <div style="font-size:13px; color:${isDisabled ? '#555' : '#888'}; display:flex; align-items:center; gap:6px; margin-bottom:16px;"><i class="material-icons-outlined" style="font-size:14px; vertical-align:text-bottom;">menu_book</i> ${c.time}</div>
              <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; margin-bottom:8px;">
                <span>Progress</span>
                <span style="color:var(--brand-primary);">${c.prog}%</span>
              </div>
              <div style="width:100%; height:4px; background:var(--bg-color); border-radius:2px; margin-bottom:24px; overflow:hidden;">
                <div style="height:100%; background:var(--brand-primary); width:${c.prog}%; ${!isDisabled ? 'animation: ddBarFill 0.8s cubic-bezier(0.16, 1, 0.3, 1) ' + (delay + 0.3) + 's both;' : ''}"></div>
              </div>
              <button style="margin-top:auto; background:${isDisabled ? '#333' : '#FFDF85'}; color:${isDisabled ? '#666' : '#111'}; font-weight:700; border:none; border-radius:6px; padding:12px; width:100%; cursor:${isDisabled ? 'not-allowed' : 'pointer'}; font-size:14px; transition:all 0.2s;" ${isDisabled ? 'disabled' : `onclick="v3App.showToast('Opening ${c.title.replace(/'/g, '')}...', 'info')"`} ${!isDisabled ? 'onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1"' : ''}>${c.cta}</button>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  handleAccommodationChange(selectElement, candId) {
    if (selectElement.value === 'YES') {
      this.openAccommodationReasonModal(candId, selectElement);
    } else {
        this.showToast('Accommodation removed.', 'info');
    }
  },

  handleExamModeChange(selectElement) {
    if (selectElement.value === 'Online') {
      // Create overlay
      const overlay = document.createElement('div');
      overlay.id = 'exam-mode-modal-overlay';
      overlay.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);';
      
      const modal = document.createElement('div');
      modal.className = 'card';
      modal.style.cssText = 'width:90%; max-width:400px; padding:24px; animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);';
      
      modal.innerHTML = `
        <h3 style="margin-top:0; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:16px;">Configure Online Exam</h3>
        <div style="margin-bottom:16px;">
          <label style="display:block; margin-bottom:6px; font-size:13px; font-weight:600;">Fee chargeable to:</label>
          <select id="exam-mode-fee-select" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);">
            <option>Organization</option>
            <option>Candidate</option>
          </select>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; padding:12px; background:var(--brand-active); border-radius:8px; border-left:3px solid var(--brand-primary);">
          <label style="font-size:13px; font-weight:600; color:var(--text-primary); cursor:pointer;" for="exam-mode-apply-all">Apply to all online tests for this class</label>
          <label class="switch">
            <input type="checkbox" id="exam-mode-apply-all">
            <span class="switch-slider"></span>
          </label>
        </div>
        <div style="display:flex; gap:12px; justify-content:flex-end;">
          <button class="btn btn-secondary" id="exam-mode-cancel" style="padding:10px 20px;">Cancel</button>
          <button class="btn btn-primary" id="exam-mode-save" style="padding:10px 20px;">Save</button>
        </div>
      `;
      
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      // Handlers
      document.getElementById('exam-mode-cancel').onclick = () => {
        selectElement.value = 'In-Class';
        overlay.remove();
      };
      
      document.getElementById('exam-mode-save').onclick = () => {
        const payer = document.getElementById('exam-mode-fee-select').value;
        const applyAll = document.getElementById('exam-mode-apply-all').checked;
        v3App.showToast(`Fee charged to: ${payer} ${applyAll ? '(Applied to all)' : ''}`, 'success');
        overlay.remove();
      };
    }
  },

  openSessionDetail(id) {
    const session = this.state.sessions.find(s => s.id === id);
    if (!session) return;
    this.currentSessionId = id;
    this.switchView('session-detail');
    document.getElementById('sd-title').textContent = session.name;
    document.getElementById('sd-subtitle').textContent = (session.status === 'draft' || session.status === 'upcoming') ? 'Draft Mode: Prepare candidates and vouchers.' : 'Review enrolled candidates and learning materials.';

    const topActions = document.getElementById('sd-top-actions');
    const voucherWarning = document.getElementById('sd-voucher-warning');
    const tabsContainer = document.getElementById('sd-tabs-container');
    const contentMaterials = document.getElementById('sd-content-materials');

    if (session.status === 'draft' || session.status === 'upcoming') {
      const btnText = session.status === 'draft' ? 'Save Class' : 'Start Class';
      const actionFn = session.status === 'draft' ? `v3App.showToast('Class Saved Successfully', 'success'); v3App.switchView('sessions');` : `v3App.startSession('${id}')`;
      
      topActions.innerHTML = `
        <button class="btn btn-secondary" onclick="v3App.openFormDrawer('candidate', '${id}')"><i class="material-icons-outlined">person_add</i> Add Candidate</button>
        <button class="btn btn-primary" onclick="${actionFn}">${btnText}</button>
      `;
      // Mock logic: randomly decide if candidates > vouchers
      const hasInsufficientVouchers = Math.random() > 0.5;
      if (hasInsufficientVouchers) {
        voucherWarning.style.display = 'flex';
      } else {
        voucherWarning.style.display = 'none';
      }
    } else if (session.status === 'ongoing') {
      topActions.innerHTML = `
        <button class="btn btn-primary" style="display:flex; align-items:center; gap:8px;" onclick="v3App.confirmStartExam('${id}')">
          <i class="material-icons">play_circle_filled</i> Start Exam
        </button>
      `;
      voucherWarning.style.display = 'none';
    } else {
      topActions.innerHTML = ``;
      voucherWarning.style.display = 'none';
    }

    if (session.status === 'draft' || session.status === 'upcoming' || session.status === 'completed') {
      tabsContainer.style.display = 'none';
    } else {
      tabsContainer.style.display = 'flex';
      document.getElementById('sd-tab-materials').style.display = 'block';
    }
    this.switchSessionDetailTab('candidates');
  },

  switchSessionDetailTab(tab) {
    document.getElementById('sd-tab-candidates').style.background = tab === 'candidates' ? 'var(--brand-active)' : 'transparent';
    document.getElementById('sd-tab-candidates').style.color = tab === 'candidates' ? 'var(--brand-primary)' : 'var(--text-secondary)';
    document.getElementById('sd-tab-candidates').style.borderBottomColor = tab === 'candidates' ? 'var(--brand-primary)' : 'transparent';

    document.getElementById('sd-tab-materials').style.background = tab === 'materials' ? 'var(--brand-active)' : 'transparent';
    document.getElementById('sd-tab-materials').style.color = tab === 'materials' ? 'var(--brand-primary)' : 'var(--text-secondary)';
    document.getElementById('sd-tab-materials').style.borderBottomColor = tab === 'materials' ? 'var(--brand-primary)' : 'transparent';

    document.getElementById('sd-content-candidates').style.display = tab === 'candidates' ? 'block' : 'none';
    document.getElementById('sd-content-materials').style.display = tab === 'materials' ? 'block' : 'none';

    if (tab === 'candidates') this.renderSessionDetailCandidates();
    if (tab === 'materials') this.renderSessionDetailMaterials();
  },

  renderSessionDetailCandidates() {
    const session = this.state.sessions.find(s => s.id === this.currentSessionId);
    if (!session) return;

    // Filter candidates for this session, or show a subset for demo
    const cands = this.state.candidates.slice(0, session.candidateCount || 4);
    const thead = document.getElementById('sd-candidates-thead');
    const tbody = document.getElementById('sd-candidates-tbody');
    
    if (session.status === 'draft' || session.status === 'upcoming' || session.status === 'ongoing') {
      thead.innerHTML = `
        <tr>
          <th>Candidate</th>
          <th>Candidate ID</th>
          <th>ID Verified</th>
          <th>Voucher Code</th>
          <th>Progress</th>
          <th>Accomm.</th>
          <th>Exam Mode</th>
          <th>Retake</th>
          <th>Retake Mode</th>
          <th>Action</th>
        </tr>
      `;
      if (cands.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates enrolled yet.</td></tr>`;
        return;
      }
      
      tbody.innerHTML = cands.map((c, idx) => {
        let vBadge = '<span class="badge badge-success">Active</span>';
        let progVal = c.learningProgress || 45;
        let progBar = `<div style="display:flex; align-items:center; gap:8px;"><span style="font-size:12px; font-weight:600;">${progVal}%</span><div style="flex:1; height:6px; background:var(--border-light); border-radius:3px; overflow:hidden;"><div style="width:${progVal}%; height:100%; background:var(--brand-primary);"></div></div></div>`;
        
        if (session.status === 'draft' || session.status === 'upcoming') {
          progVal = 0;
          progBar = `<span style="color:var(--text-tertiary);">0%</span>`;
          if (c.voucherCode) {
            vBadge = `<div style="display:flex; align-items:center; gap:8px;">
                <span class="badge" style="background:var(--border-light); color:var(--text-secondary); font-family:monospace;">${c.voucherCode}</span>
              </div>`;
          } else {
            vBadge = '<button class="btn btn-primary" style="padding:4px 8px; font-size:11px;">Assign Voucher Code</button>';
          }
        } else {
          // Mock variations for ongoing
          if (idx === 1) {
            vBadge = '<span class="badge" style="background:var(--bg-color); border:1px solid var(--border-color);">Unused</span>';
            progBar = `<div style="display:flex; align-items:center; gap:8px;"><span style="font-size:12px; font-weight:600;">0%</span><div style="flex:1; height:6px; background:var(--border-light); border-radius:3px; overflow:hidden;"><div style="width:0%; height:100%; background:var(--brand-primary);"></div></div></div>`;
          } else if (idx === 2) {
            vBadge = '<button class="btn btn-primary" style="padding:4px 8px; font-size:11px;">Assign Voucher Code</button>';
            progBar = `<span style="color:var(--text-tertiary);">--</span>`;
          }
        }
        
        let accomValue = (idx === 0) ? 'YES' : 'NO';
        let accomHtml = `
          <select style="padding:6px; border-radius:4px; border:1px solid var(--border-color); font-size:12px; background:var(--bg-color);" onclick="event.stopPropagation();" onchange="v3App.handleAccommodationChange(this, '${c.id}')">
            <option value="NO" ${accomValue === 'NO' ? 'selected' : ''}>NO</option>
            <option value="YES" ${accomValue === 'YES' ? 'selected' : ''}>YES</option>
          </select>
        `;
        
        return `
        <tr style="cursor:pointer; vertical-align:middle;" onclick="if(event.target.tagName !== 'SELECT' && event.target.tagName !== 'BUTTON' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'LABEL') v3App.openLearningDeepDive('${c.id}', '${c.name.replace(/'/g,'')}', '${session.name.replace(/'/g,'')}', ${c.learningProgress||45})">
          <!-- Candidate -->
          <td>
            <div style="font-weight:600; font-size:13px; color:var(--text-primary); white-space:nowrap;">${c.name}</div>
            <div style="font-size:11px; color:var(--text-secondary); white-space:nowrap;">${c.email || 'student@domain.com'}</div>
          </td>
          
          <!-- Student ID -->
          <td class="font-mono" style="font-size:12px; color:var(--text-secondary);">${c.rollNo || c.id}</td>
          
          <!-- Verified ID -->
          <td>
            <label class="switch" style="transform:scale(0.85); transform-origin:left center; margin:0;" onclick="event.stopPropagation()">
              <input type="checkbox" class="physical-id-check" data-cand-id="${c.id}" onchange="if(this.checked) { v3App.showToast('ID Verified', 'success'); }">
              <span class="switch-slider"></span>
            </label>
          </td>
          
          <!-- Voucher Code -->
          <td>${vBadge}</td>
          
          <!-- Progress -->
          <td style="min-width:100px;">${progBar}</td>
          
          <!-- Accommodations -->
          <td>${accomHtml}</td>
          
          <!-- Exam Mode -->
          <td>
            <select style="padding:4px; border-radius:4px; border:1px solid var(--border-color); font-size:11px; background:var(--bg-color);" onclick="event.stopPropagation();" onchange="v3App.handleExamModeChange(this)">
              <option value="In-Class" selected>In-Class</option>
              <option value="Online">Online</option>
            </select>
          </td>
          
          <!-- Retake -->
          <td>
            <label class="switch" style="transform:scale(0.85); transform-origin:left center; margin:0;" onclick="event.stopPropagation()">
              <input type="checkbox" onchange="if(this.checked) { v3App.showToast('Retake Enabled', 'success'); document.getElementById('retake-mode-${c.id}').disabled=false; } else { document.getElementById('retake-mode-${c.id}').disabled=true; }">
              <span class="switch-slider"></span>
            </label>
          </td>
          
          <!-- Retake Mode -->
          <td>
            <select id="retake-mode-${c.id}" disabled style="padding:4px; border-radius:4px; border:1px solid var(--border-color); font-size:11px; background:var(--bg-color);" onclick="event.stopPropagation();" onchange="v3App.handleExamModeChange(this)">
              <option value="In-Class" selected>In-Class</option>
              <option value="Online">Online</option>
            </select>
          </td>
          
          <!-- Action -->
          <td style="text-align:center;">
            <button class="icon-button" style="color:var(--status-error); padding:4px;" onclick="event.stopPropagation(); v3App.showToast('Removed', 'info')">
              <i class="material-icons-outlined" style="font-size:16px;">delete</i>
            </button>
          </td>
        </tr>
      `}).join('');

    } else if (session.status === 'completed') {
      thead.innerHTML = `
        <tr>
          <th>Candidate Name</th>
          <th>Email ID</th>
          <th>Candidate ID</th>
          <th>Score (out of 100)</th>
          <th>Result</th>
          <th>Flags / Incident</th>
          <th>Retake Status</th>
        </tr>
      `;
      if (cands.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates enrolled yet.</td></tr>`;
        return;
      }
      tbody.innerHTML = cands.map(c => {
        // Mock data generation
        const score = Math.floor(Math.random() * 100);
        let result = '';
        let resultClass = '';
        let retakeDate = '--';
        
        if (score > 75) {
          result = 'Passed';
          resultClass = 'badge-success';
        } else if (score > 40) {
          result = 'Failed';
          resultClass = 'badge-error';
          // Mock retake date
          const date = new Date();
          date.setDate(date.getDate() + 7);
          retakeDate = date.toLocaleDateString();
        } else {
          result = 'Deactivated';
          resultClass = 'badge-error';
        }
        
        // Mock flags
        const flagsCount = Math.floor(Math.random() * 3);
        let flagsHtml = '--';
        if (flagsCount > 0) {
          const reasons = ['Multiple Faces', 'Looking Away', 'Background Noise'];
          const reason = reasons[Math.floor(Math.random() * reasons.length)];
          flagsHtml = `<div style="display:flex; flex-direction:column; gap:4px;">
            <span style="color:var(--status-error); font-weight:600; font-size:12px;">${flagsCount} Flag(s)</span>
            <span style="font-size:11px; color:var(--text-secondary);">${reason}</span>
          </div>`;
        }
        
        return `
          <tr>
            <td><div style="font-weight:600; font-size:14px;">${c.name}</div></td>
            <td style="font-size:13px; color:var(--text-secondary);">${c.email}</td>
            <td class="font-mono" style="font-size:13px; color:var(--text-secondary);">${c.rollNo || c.id}</td>
            <td style="font-weight:600; font-variant-numeric: tabular-nums;">${score} / 100</td>
            <td><span class="badge ${resultClass}">${result}</span></td>
            <td>${flagsHtml}</td>
            <td>
              <select style="padding:6px; border-radius:4px; border:1px solid var(--border-color); font-size:12px; background:var(--bg-color);" onchange="v3App.showToast('Retake status updated.', 'success')">
                <option>Not Eligible</option>
                <option>In Class</option>
                <option>Online</option>
              </select>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      thead.innerHTML = `
        <tr>
          <th>Candidate Name</th>
          <th>Email ID</th>
          <th>Candidate ID</th>
          <th>Voucher Code Status</th>
          <th>Learning Progress</th>
          <th>Accommodations</th>
          <th>Exam Mode</th>
          <th>Retake Exam Mode</th>
          <th>Retake Config</th>
          <th>Actions</th>
        </tr>
      `;
      if (cands.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates enrolled yet.</td></tr>`;
        return;
      }
      tbody.innerHTML = cands.map(c => {
        const voucherStatuses = ['Active', 'Unused', 'Not Assigned'];
        const vStatus = voucherStatuses[Math.floor(Math.random() * voucherStatuses.length)];
        
        let vBadge = '';
        let progressHtml = '';
        
        if (vStatus === 'Not Assigned') {
          vBadge = `<button class="btn btn-primary" style="padding:4px 8px; font-size:11px;" onclick="event.stopPropagation(); v3App.showToast('Voucher Code Assigned', 'success')">Assign Voucher Code</button>`;
          progressHtml = `<span style="color:var(--text-secondary);">-- (Locked)</span>`;
        } else {
          vBadge = `<span class="badge ${vStatus === 'Active' ? 'badge-success' : 'badge-info'}">${vStatus}</span>`;
          const prog = Math.floor(Math.random() * 80) + 10;
          progressHtml = `
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:12px; font-weight:600;">${prog}%</span>
              <div style="flex:1; height:4px; background:var(--border-light); border-radius:2px; overflow:hidden;">
                <div style="width:${prog}%; height:100%; background:var(--brand-primary);"></div>
              </div>
            </div>`;
        }

        const accommYes = Math.random() > 0.7;
        const accommHtml = accommYes ? 
          `<span class="badge badge-warning" style="cursor:help;" title="Extended time (1.5x)">YES</span>` : 
          `<span class="badge" style="background:var(--border-light); color:var(--text-secondary);">NO</span>`;

        return `
          <tr style="cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='var(--hover-bg)'" onmouseout="this.style.background=''" onclick="v3App.openLearningDeepDive('${c.id}', '${vStatus}')">
            <td><div style="font-weight:600; font-size:14px;">${c.name}</div></td>
            <td style="font-size:13px; color:var(--text-secondary);">${c.email}</td>
            <td class="font-mono" style="font-size:13px; color:var(--text-secondary);">${c.rollNo || c.id}</td>
            <td>${vBadge}</td>
            <td style="min-width:120px;">${progressHtml}</td>
            <td>${accommHtml}</td>
            <td>
              <select style="padding:6px; border-radius:4px; border:1px solid var(--border-color); font-size:12px; background:var(--bg-color);" onclick="event.stopPropagation();" onchange="v3App.handleExamModeChange(this)">
                <option value="In-Class" selected>In-Class</option>
                <option value="Online">Online</option>
              </select>
            </td>
            <td>
              <select style="padding:6px; border-radius:4px; border:1px solid var(--border-color); font-size:12px; background:var(--bg-color);" onclick="event.stopPropagation();" onchange="v3App.handleExamModeChange(this)">
                <option value="In-Class" selected>In-Class</option>
                <option value="Online">Online</option>
              </select>
            </td>
            <td onclick="event.stopPropagation();">
              <div style="display:flex; align-items:center; gap:8px;">
                <label class="switch" style="transform:scale(0.8); margin:0;">
                  <input type="checkbox" onchange="this.parentElement.nextElementSibling.style.display = this.checked ? 'block' : 'none'">
                  <span class="switch-slider"></span>
                </label>
                <select style="display:none; padding:4px; border-radius:4px; border:1px solid var(--border-color); font-size:11px; background:var(--bg-color);">
                  <option>In Class</option>
                  <option>Online</option>
                </select>
              </div>
            </td>
            <td onclick="event.stopPropagation();">
              <button class="icon-button" style="color:var(--status-error); padding:4px;" onclick="v3App.showToast('Candidate removed', 'info')"><i class="material-icons-outlined" style="font-size:18px;">delete</i></button>
            </td>
          </tr>
        `;
      }).join('');
    }

  },

  renderSessionDetailMaterials() {
    const session = this.state.sessions.find(s => s.id === this.currentSessionId);
    const grid = document.getElementById('sd-materials-grid');
    const materials = this.state.materials || [];

    if (materials.length === 0) {
      grid.innerHTML = '<div style="text-align:center; padding:48px; color:var(--text-secondary); width:100%;"><i class="material-icons-outlined" style="font-size:48px; opacity:0.5; margin-bottom:16px;">library_books</i><br>No materials attached to this class.</div>';
      return;
    }

    const cands = this.state.candidates.slice(0, session?.candidateCount || 4);
    const totalCandidates = cands.length || 10; // Fallback to 10 for demo

    // Inject styles for premium cards if not already present
    if (!document.getElementById('lm-premium-styles')) {
      const style = document.createElement('style');
      style.id = 'lm-premium-styles';
      style.innerHTML = `
        .lm-premium-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:24px; padding-top:16px; }
        .lm-prem-card { background:#ffffff; border:1px solid rgba(0,0,0,0.06); border-radius:20px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.03); transition:all 0.3s cubic-bezier(0.16,1,0.3,1); display:flex; flex-direction:column; position:relative; }
        .lm-prem-card:hover { transform:translateY(-6px); box-shadow:0 12px 32px rgba(0,0,0,0.08); border-color:rgba(0,0,0,0.1); }
        .lm-prem-thumb-container { position:relative; height:180px; width:100%; overflow:hidden; background:#f1f5f9; }
        .lm-prem-thumb { width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease; }
        .lm-prem-card:hover .lm-prem-thumb { transform:scale(1.05); }
        .lm-prem-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 60%); pointer-events:none; }
        .lm-prem-tag { position:absolute; top:16px; left:16px; background:rgba(255,255,255,0.9); backdrop-filter:blur(8px); padding:6px 12px; border-radius:30px; font-size:11px; font-weight:700; color:#0f172a; text-transform:uppercase; letter-spacing:0.5px; display:flex; align-items:center; gap:6px; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
        .lm-prem-play-btn { position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:56px; height:56px; border-radius:50%; background:rgba(255,255,255,0.25); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; color:#fff; border:2px solid rgba(255,255,255,0.6); box-shadow:0 4px 24px rgba(0,0,0,0.2); transition:all 0.2s ease; cursor:pointer; z-index:2; }
        .lm-prem-play-btn:hover { background:var(--brand-primary); border-color:var(--brand-primary); transform:translate(-50%, -50%) scale(1.1); color:#111; }
        
        .lm-prem-body { padding:24px; display:flex; flex-direction:column; flex:1; }
        .lm-prem-title { font-size:18px; font-weight:700; color:#0f172a; line-height:1.4; margin-bottom:8px; }
        .lm-prem-meta { font-size:13px; color:#64748b; display:flex; align-items:center; gap:12px; font-weight:500; margin-bottom:20px; }
        
        .lm-prem-stats { background:#f8fafc; border-radius:12px; padding:16px; margin-bottom:24px; border:1px solid #e2e8f0; }
        .lm-prem-stats-hdr { display:flex; justify-content:space-between; margin-bottom:12px; }
        .lm-prem-stat-item { text-align:center; }
        .lm-prem-stat-val { font-size:18px; font-weight:800; line-height:1.2; }
        .lm-prem-stat-lbl { font-size:10px; font-weight:700; text-transform:uppercase; color:#64748b; letter-spacing:0.5px; margin-top:2px; }
        
        .lm-prem-bar-container { height:8px; width:100%; background:#e2e8f0; border-radius:4px; overflow:hidden; display:flex; }
        .lm-prem-bar-segment { height:100%; transition:width 0.8s cubic-bezier(0.16,1,0.3,1); }
        .lm-prem-bar-success { background:linear-gradient(90deg, #10b981, #34d399); }
        .lm-prem-bar-warning { background:linear-gradient(90deg, #f59e0b, #fbbf24); }
        
        .lm-prem-actions { display:flex; gap:12px; margin-top:auto; }
        .lm-prem-btn { flex:1; padding:12px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s; border:none; }
        .lm-prem-btn-primary { background:var(--brand-primary); color:#111; box-shadow:0 4px 12px rgba(249,173,0,0.2); }
        .lm-prem-btn-primary:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(249,173,0,0.3); background:#fbbf24; }
        .lm-prem-btn-secondary { background:#f1f5f9; color:#334155; border:1px solid #e2e8f0; }
        .lm-prem-btn-secondary:hover { background:#e2e8f0; color:#0f172a; }

        .lm-filters { display:flex; gap:12px; margin-bottom:24px; overflow-x:auto; padding-bottom:8px; }
        .lm-filter-btn { padding:8px 20px; border-radius:30px; font-size:14px; font-weight:600; color:#64748b; background:#fff; border:1px solid #e2e8f0; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
        .lm-filter-btn:hover { border-color:var(--brand-primary); color:var(--brand-primary); }
        .lm-filter-btn.active { background:var(--brand-primary); border-color:var(--brand-primary); color:#111; box-shadow:0 4px 12px rgba(249,173,0,0.2); }
      `;
      document.head.appendChild(style);
    }

    const thumbMap = { 'document': '/thumb_food_safety.png', 'ebook': '/thumb_food_safety.png', 'video': '/thumb_culinary.png', 'podcast': '/thumb_culinary.png', 'flashcard': '/thumb_haccp.png', 'practice exam': '/thumb_practice_exam.png' };
    const thumbFallbacks = ['/thumb_food_safety.png', '/thumb_haccp.png', '/thumb_allergen.png', '/thumb_culinary.png', '/thumb_practice_exam.png'];

    const headerHtml = `
      <div class="lm-filters">
        <button class="lm-filter-btn active" onclick="this.parentElement.querySelectorAll('.lm-filter-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');">All Materials</button>
        <button class="lm-filter-btn" onclick="this.parentElement.querySelectorAll('.lm-filter-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');">E-books & Guides</button>
        <button class="lm-filter-btn" onclick="this.parentElement.querySelectorAll('.lm-filter-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');">Videos</button>
        <button class="lm-filter-btn" onclick="this.parentElement.querySelectorAll('.lm-filter-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');">Practice Exams</button>
      </div>
    `;

    const cardsHtml = '<div class="lm-premium-grid">' + materials.map((m, i) => {
      const type = (m.type || 'ebook').toLowerCase();
      let icon = 'menu_book', ctaText = 'Read Document', ctaIcon = 'import_contacts', tagColor = '#3b82f6';
      
      if (type === 'video') { icon = 'play_circle'; ctaText = 'Watch Video'; ctaIcon = 'play_arrow'; tagColor = '#ef4444'; }
      else if (type === 'podcast') { icon = 'mic'; ctaText = 'Listen Now'; ctaIcon = 'headphones'; tagColor = '#8b5cf6'; }
      else if (type === 'flashcard') { icon = 'style'; ctaText = 'Study Cards'; ctaIcon = 'auto_awesome_motion'; tagColor = '#f59e0b'; }
      else if (type === 'practice exam') { icon = 'quiz'; ctaText = 'Start Assessment'; ctaIcon = 'edit_note'; tagColor = '#10b981'; }

      const thumb = m.thumb || thumbMap[type] || thumbFallbacks[i % thumbFallbacks.length];
      
      // Generate realistic mock data
      const completed = Math.floor(Math.random() * (totalCandidates * 0.7));
      const inProgress = Math.floor(Math.random() * (totalCandidates - completed));
      const pending = totalCandidates - completed - inProgress;
      
      const compPct = Math.round((completed / totalCandidates) * 100);
      const progPct = Math.round((inProgress / totalCandidates) * 100);

      const playBtn = (type === 'video' || type === 'podcast') ? 
        `<div class="lm-prem-play-btn" onclick="v3App.showToast('Launching player...', 'info')"><i class="material-icons">play_arrow</i></div>` : '';

      return `
        <div class="lm-prem-card" style="animation: fadeSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s both;">
          <div class="lm-prem-thumb-container">
            <img src="${thumb}" class="lm-prem-thumb" alt="Cover">
            <div class="lm-prem-overlay"></div>
            <div class="lm-prem-tag" style="color:${tagColor};"><i class="material-icons-outlined" style="font-size:14px;">${icon}</i> ${type}</div>
            ${playBtn}
          </div>
          <div class="lm-prem-body">
            <div class="lm-prem-title">${m.title}</div>
            <div class="lm-prem-meta">
              <span style="display:flex;align-items:center;gap:4px;"><i class="material-icons-outlined" style="font-size:14px;">schedule</i> ${m.duration || '60 mins'}</span>
              <span>•</span>
              <span>Required</span>
            </div>
            
            <div class="lm-prem-stats">
              <div class="lm-prem-stats-hdr">
                <div class="lm-prem-stat-item">
                  <div class="lm-prem-stat-val" style="color:#10b981;">${completed}</div>
                  <div class="lm-prem-stat-lbl">Completed</div>
                </div>
                <div class="lm-prem-stat-item">
                  <div class="lm-prem-stat-val" style="color:#f59e0b;">${inProgress}</div>
                  <div class="lm-prem-stat-lbl">In Progress</div>
                </div>
                <div class="lm-prem-stat-item">
                  <div class="lm-prem-stat-val" style="color:#64748b;">${pending}</div>
                  <div class="lm-prem-stat-lbl">Not Started</div>
                </div>
              </div>
              <div class="lm-prem-bar-container">
                <div class="lm-prem-bar-segment lm-prem-bar-success" style="width:${compPct}%" title="${compPct}% Completed"></div>
                <div class="lm-prem-bar-segment lm-prem-bar-warning" style="width:${progPct}%" title="${progPct}% In Progress"></div>
              </div>
              <div style="text-align:center; font-size:11px; font-weight:600; color:#64748b; margin-top:8px;">CLASS PROGRESS: ${compPct}%</div>
            </div>
            
            <div class="lm-prem-actions">
              <button class="lm-prem-btn lm-prem-btn-secondary" onclick="v3App.openMaterialProgressDrawer('${encodeURIComponent(m.title).replace(/'/g, '%27')}')">
                <i class="material-icons-outlined" style="font-size:18px;">insights</i> Progress
              </button>
              <button class="lm-prem-btn lm-prem-btn-primary" onclick="v3App.openMaterialViewer('${type}', '${encodeURIComponent(m.title).replace(/'/g, '%27')}')">
                <i class="material-icons-outlined" style="font-size:18px;">${ctaIcon}</i> ${ctaText}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('') + '</div>';

    grid.innerHTML = headerHtml + cardsHtml;
  },

  openMaterialProgressDrawer(encodedTitle) {
    const title = decodeURIComponent(encodedTitle);
    document.getElementById('drawer-title').textContent = 'Insights: Progress Details';
    document.getElementById('drawer-subtitle').textContent = title;
    document.getElementById('universal-drawer').classList.add('open');
    
    const cands = this.state.candidates || [];
    const displayCands = cands.slice(0, 15);
    
    // Categorize
    const completed = [];
    const active = [];
    const notStarted = [];
    
    displayCands.forEach(c => {
      const rand = Math.random();
      if (rand > 0.6) completed.push(c);
      else if (rand > 0.3) active.push(c);
      else notStarted.push(c);
    });

    const generateList = (list, status, colorStyle) => {
      if (list.length === 0) return `<div style="padding:16px; color:var(--text-secondary); text-align:center; font-size:13px; background:var(--surface-color); border-bottom:1px solid var(--border-light);">No candidates in this category</div>`;
      return list.map(c => {
        let progText = '';
        if (status === 'Completed') progText = '100% finished';
        if (status === 'Active') progText = Math.floor(Math.random() * 80 + 10) + '% finished';
        if (status === 'Not Started') progText = '0% finished';

        return `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; border-bottom:1px solid var(--border-light); background:var(--surface-color);">
            <div style="display:flex; align-items:center; gap:16px;">
              <img src="${c.photo || 'https://via.placeholder.com/150'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid var(--border-color);">
              <div>
                <div style="font-size:14px; font-weight:600; color:var(--text-primary); margin-bottom:4px;">${c.name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">ID: ${c.rollNo || c.id}</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:11px; padding:4px 10px; border-radius:20px; font-weight:600; margin-bottom:6px; display:inline-block; ${colorStyle}">${status}</div>
              <div style="font-size:11px; color:var(--text-tertiary);">${progText}</div>
            </div>
          </div>
        `;
      }).join('');
    };

    const completedHtml = generateList(completed, 'Completed', 'background:var(--status-success-bg); color:var(--status-success); border:1px solid var(--status-success);');
    const activeHtml = generateList(active, 'Active', 'background:var(--status-warning-bg); color:var(--status-warning); border:1px solid var(--status-warning);');
    const notStartedHtml = generateList(notStarted, 'Not Started', 'background:var(--border-light); color:var(--text-secondary); border:1px solid var(--border-color);');

    document.getElementById('drawer-content').innerHTML = `
      <div style="background:#f8fafc; border-radius:12px; padding:16px; margin-bottom:20px; border:1px solid var(--border-color);">
        <h4 style="margin:0 0 8px 0; font-size:14px; color:var(--text-primary);">Learning Material</h4>
        <div style="font-size:16px; font-weight:700; color:var(--brand-primary);">${title}</div>
      </div>
      
      <div style="margin-bottom:24px;">
        <div style="font-size:13px; font-weight:600; color:var(--status-success); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid var(--status-success); padding-bottom:4px;">Completed (${completed.length})</div>
        <div style="border:1px solid var(--border-light); border-radius:8px; overflow:hidden;">
          ${completedHtml}
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <div style="font-size:13px; font-weight:600; color:var(--status-warning); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid var(--status-warning); padding-bottom:4px;">Active (${active.length})</div>
        <div style="border:1px solid var(--border-light); border-radius:8px; overflow:hidden;">
          ${activeHtml}
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <div style="font-size:13px; font-weight:600; color:var(--text-secondary); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid var(--text-secondary); padding-bottom:4px;">Not Started (${notStarted.length})</div>
        <div style="border:1px solid var(--border-light); border-radius:8px; overflow:hidden;">
          ${notStartedHtml}
        </div>
      </div>
    `;
    
    document.getElementById('drawer-action-btn').style.display = 'none';
  },

  openMaterialViewer(type, encodedTitle) {
    const title = decodeURIComponent(encodedTitle);
    
    // Set headers
    const typeLabel = document.getElementById('mv-type');
    const titleLabel = document.getElementById('mv-title');
    const iconLabel = document.getElementById('mv-icon');
    
    if (typeLabel) typeLabel.textContent = type;
    if (titleLabel) titleLabel.textContent = title;
    
    let icon = 'menu_book';
    if (type === 'video') icon = 'play_circle';
    if (type === 'podcast') icon = 'mic';
    if (type === 'flashcard') icon = 'style';
    if (type === 'practice exam') icon = 'quiz';
    if (iconLabel) iconLabel.textContent = icon;
    
    // Hide the left TOC sidebar for iframe full width
    const tocList = document.getElementById('mv-toc-list');
    if (tocList && tocList.parentElement) {
      tocList.parentElement.style.display = 'none';
    }
    
    // Set Main Area to iframe
    const mainArea = document.getElementById('mv-main-area');
    if (mainArea) {
      mainArea.innerHTML = `<iframe src="learning_material.html" style="width:100%; height:100%; border:none; display:block;"></iframe>`;
    }
    
    // Show overlay
    document.getElementById('material-viewer-overlay').style.display = 'block';
    document.getElementById('material-viewer-modal').style.display = 'flex';
  },

  closeMaterialViewer() {
    const overlay = document.getElementById('material-viewer-overlay');
    const modal = document.getElementById('material-viewer-modal');
    if (overlay) overlay.style.display = 'none';
    if (modal) {
      modal.style.display = 'none';
      // Stop any playing media by clearing the injected iframe
      const mainArea = document.getElementById('mv-main-area');
      if (mainArea) mainArea.innerHTML = '';
    }
  },

  openHubMaterialDetail(encodedTitle) {
    const title = encodedTitle ? decodeURIComponent(encodedTitle) : 'Material';
    const detail = document.getElementById('material-hub-detail-view');
    if (!detail) return;
    const titleEl = document.getElementById('hub-detail-title');
    if (titleEl) titleEl.textContent = title;
    // Hide the hub grid/list behind the drill-down
    const grid = document.getElementById('materials-grid');
    const list = document.getElementById('materials-list-view');
    if (grid) grid.style.display = 'none';
    if (list) list.style.display = 'none';
    detail.style.display = 'block';
    // Default to the first tab and populate its content
    this.switchHubLmTab('ebooks', true);
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  closeHubMaterialDetail() {
    const detail = document.getElementById('material-hub-detail-view');
    if (detail) detail.style.display = 'none';
    // Restore the materials list/grid behind it
    const grid = document.getElementById('materials-grid');
    const list = document.getElementById('materials-list-view');
    if (grid) grid.style.display = '';
    if (list) list.style.display = '';
  },

  switchHubLmTab(tab, silent) {
    // Toggle the active state on the resource navigation tabs
    const tabs = document.querySelectorAll('#hub-learning-tabs .l-tab');
    const labelMap = {
      ebooks: 'Ebook', videos: 'Video', podcasts: 'Podcast',
      flashcards: 'Flashcards', practice: 'Practice Test'
    };
    const target = (labelMap[tab] || '').toLowerCase();
    tabs.forEach(btn => {
      const isActive = btn.textContent.trim().toLowerCase() === target;
      btn.classList.toggle('active', isActive);
    });
    // Populate the content grid for the selected resource type
    const gridEl = document.getElementById('hub-lm-content-grid');
    if (gridEl) {
      const iconMap = { ebooks: 'menu_book', videos: 'play_circle', podcasts: 'mic', flashcards: 'style', practice: 'quiz' };
      const icon = iconMap[tab] || 'menu_book';
      const label = labelMap[tab] || 'Resource';
      gridEl.innerHTML = Array.from({ length: 3 }, (_, i) => `
        <div class="card" style="padding:20px; display:flex; flex-direction:column; gap:12px;">
          <i class="material-icons-outlined" style="font-size:32px; color:var(--brand-primary);">${icon}</i>
          <div style="font-weight:700; font-size:15px;">${label} Resource ${i + 1}</div>
          <div style="font-size:13px; color:var(--text-secondary);">Chapter ${i + 1} &middot; ~${15 + i * 10} min</div>
          <button class="btn btn-secondary" style="margin-top:auto;" onclick="v3App.openMaterialViewer('${tab}', '${encodeURIComponent(label + ' Resource ' + (i + 1))}')">Open</button>
        </div>
      `).join('');
    }
    if (!silent) this.showToast(`Showing ${labelMap[tab] || tab} resources`, 'info');
  },

  openRedeemVoucherModal(candId) {
    this._modalCandidateId = candId || null;
    const input = document.getElementById('redeem-voucher-input');
    if (input) input.value = '';
    const modal = document.getElementById('redeem-voucher-modal');
    if (modal) modal.classList.add('open');
  },

  submitRedeemVoucher() {
    const input = document.getElementById('redeem-voucher-input');
    const code = input ? input.value.trim() : '';
    if (!code) {
      this.showToast('Please enter a voucher code.', 'error');
      return;
    }
    if (input) input.value = '';
    const modal = document.getElementById('redeem-voucher-modal');
    if (modal) modal.classList.remove('open');
    this.showToast(`Voucher Code ${code} verified and replaced.`, 'success');
    this._modalCandidateId = null;
  },

  openDeleteCandidateModal(candId) {
    this._modalCandidateId = candId || null;
    const input = document.getElementById('delete-reason-input');
    if (input) input.value = '';
    // Close the drawer behind so the modal is the focus
    this.closeDrawer();
    const modal = document.getElementById('delete-reason-modal');
    if (modal) modal.classList.add('open');
  },

  submitDeleteCandidate() {
    const input = document.getElementById('delete-reason-input');
    const reason = input ? input.value.trim() : '';
    if (!reason) {
      this.showToast('Please provide a reason for deletion.', 'error');
      return;
    }
    // Actually remove the candidate from state and re-render
    const id = this._modalCandidateId;
    if (id && this.state.candidates) {
      this.state.candidates = this.state.candidates.filter(c => c.id !== id);
      if (typeof this.renderCandidates === 'function') this.renderCandidates();
    }
    if (input) input.value = '';
    const modal = document.getElementById('delete-reason-modal');
    if (modal) modal.classList.remove('open');
    this.showToast('Candidate has been permanently removed.', 'success');
    this._modalCandidateId = null;
  },

  openAccommodationReasonModal(candId, selectElement) {
    this._accomCtx = { candId: candId || null, selectElement: selectElement || null };
    const input = document.getElementById('accommodation-reason-input');
    if (input) input.value = '';
    const modal = document.getElementById('accommodation-reason-modal');
    if (modal) modal.classList.add('open');
  },

  submitAccommodationReason() {
    const input = document.getElementById('accommodation-reason-input');
    const reason = input ? input.value.trim() : '';
    if (!reason) {
      this.showToast('Please provide a reason for the accommodation.', 'error');
      return;
    }
    if (input) input.value = '';
    const modal = document.getElementById('accommodation-reason-modal');
    if (modal) modal.classList.remove('open');
    this.showToast('Accommodation reason saved for candidate.', 'success');
    this._accomCtx = null;
  },

  openBatchProgressModal() {
    const body = document.getElementById('batch-modal-body');
    const cands = (this.state.monitorState && this.state.monitorState.candidates) || this.state.candidates || [];
    if (body) {
      if (!cands.length) {
        body.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text-secondary);">No active candidates to display.</div>`;
      } else {
        const totalQ = 50;
        // Realistic, varied, *stable* progress: spread candidates across the
        // full range (not everyone at 100%) using a deterministic per-candidate
        // seed so the numbers don't flicker between opens.
        const list = cands.map((c, i) => {
          const seed = parseInt(String(c.id).replace(/\D/g, ''), 10) || (i + 1);
          let attempted = c.attemptedQ;
          if (attempted == null) {
            // Spread: a few finished, most mid-exam, a couple just starting.
            const buckets = [50, 47, 42, 38, 31, 27, 24, 19, 15, 11, 8, 4];
            attempted = buckets[(seed + i) % buckets.length];
          }
          attempted = Math.max(0, Math.min(totalQ, attempted));
          return { name: c.name || 'Candidate', attempted, pct: Math.round((attempted / totalQ) * 100) };
        });

        const submitted = list.filter(c => c.pct >= 100).length;
        const avg = list.length ? Math.round(list.reduce((s, c) => s + c.pct, 0) / list.length) : 0;
        const palette = ['#1E40AF', '#7C3AED', '#0891B2', '#C2410C', '#0F766E', '#9333EA', '#2563EB', '#DB2777'];
        const initials = (n) => n.trim().split(/\s+/).map(w => w[0] || '').slice(0, 2).join('').toUpperCase() || '?';

        const cards = list.map((c, i) => {
          const done = c.pct >= 100;
          const idle = c.attempted === 0;
          const accent = done ? 'var(--status-success)' : (idle ? '#6b7280' : 'var(--brand-primary)');
          const status = done ? 'Submitted' : (idle ? 'Not started' : 'In progress');
          const chipBg = done ? 'rgba(34,197,94,0.15)' : (idle ? 'rgba(107,114,128,0.18)' : 'rgba(30,64,175,0.15)');
          const chipFg = done ? 'var(--status-success)' : (idle ? '#9ca3af' : 'var(--brand-primary)');
          return `
            <div class="batch-list-item" style="--bli-accent:${accent};">
              <div class="bli-top">
                <span class="bli-avatar" style="background:${palette[i % palette.length]};">${initials(c.name)}</span>
                <span class="bli-name">${c.name}</span>
                <span class="bli-pct" style="color:${accent};">${c.pct}%</span>
              </div>
              <div class="bli-bar"><div style="width:${c.pct}%; background:${accent};"></div></div>
              <div class="bli-meta">
                <span>${c.attempted}/${totalQ} questions</span>
                <span class="bli-chip" style="background:${chipBg}; color:${chipFg};">${status}</span>
              </div>
            </div>`;
        }).join('');

        body.innerHTML = `
          <div class="batch-summary">
            <div class="batch-stat"><div class="batch-stat-val">${list.length}</div><div class="batch-stat-lbl">Candidates</div></div>
            <div class="batch-stat"><div class="batch-stat-val" style="color:var(--status-success);">${submitted}</div><div class="batch-stat-lbl">Submitted</div></div>
            <div class="batch-stat"><div class="batch-stat-val" style="color:var(--brand-primary);">${avg}%</div><div class="batch-stat-lbl">Avg progress</div></div>
          </div>
          <div class="batch-grid">${cards}</div>`;
      }
    }
    const modal = document.getElementById('batch-progress-modal');
    if (modal) modal.classList.add('open');
  },

  switchMmTab(tab) {
    const isAnalytics = tab === 'analytics';
    
    const btnA = document.getElementById('mm-tab-btn-analytics');
    const btnP = document.getElementById('mm-tab-btn-preview');
    const indA = document.getElementById('mm-tab-ind-analytics');
    const indP = document.getElementById('mm-tab-ind-preview');
    
    if (isAnalytics) {
      btnA.style.color = 'var(--brand-primary)';
      btnP.style.color = 'var(--text-secondary)';
      indA.style.display = 'block';
      indP.style.display = 'none';
    } else {
      btnP.style.color = 'var(--brand-primary)';
      btnA.style.color = 'var(--text-secondary)';
      indP.style.display = 'block';
      indA.style.display = 'none';
    }
    
    document.getElementById('mm-tab-analytics').style.display = isAnalytics ? 'block' : 'none';
    document.getElementById('mm-tab-preview').style.display = isAnalytics ? 'none' : 'block';
  },

  openGlobalMaterialManageDrawer(encodedTitle, type, duration, thumb) {
    const title = decodeURIComponent(encodedTitle);
    this.switchView('material-management');
    
    document.getElementById('mm-title').textContent = title;
    document.getElementById('mm-subtitle').textContent = `${type} • ${duration}`;
    
    // Switch back to analytics tab automatically
    this.switchMmTab('analytics');
    
    // Generate classes and candidate list
    const cands = this.state.candidates || [];
    const classes = ['Final Exams - Batch A', 'Safety Training - Batch B', 'Culinary Basics 101'];
    
    // Progress formatting based on type
    const getProgressHtml = (c, typeStr) => {
      let t = (typeStr || '').toLowerCase();
      if (t.includes('book') || t.includes('guide')) {
        return `Ebook: <span style="font-weight:600;">${Math.floor(Math.random()*3 + 1)}/3 pages read</span>`;
      } else if (t.includes('video')) {
        return `Video: <span style="font-weight:600;">${Math.floor(Math.random()*10 + 1)}/10 mins watched</span>`;
      } else if (t.includes('flash')) {
        return `Flashcards: <span style="font-weight:600;">${Math.floor(Math.random()*6 + 1)}/6 reviewed</span>`;
      } else if (t.includes('podcast')) {
        return `Podcast: <span style="font-weight:600;">Taken ${Math.floor(Math.random()*15 + 1)} times. Avg score: ${(Math.random()*2 + 8).toFixed(1)}</span>`;
      } else if (t.includes('practice') || t.includes('exam')) {
        return `Score: <span style="font-weight:600;">${(Math.random()*30 + 70).toFixed(0)}%</span> <button class="btn btn-secondary" style="padding:4px 8px; font-size:11px; margin-left:8px;" onclick="event.stopPropagation(); const el = document.getElementById('pt-review-${c.id}'); el.style.display = el.style.display==='none'?'block':'none';">Review Mistakes</button>`;
      } else {
        return `Progress: <span style="font-weight:600;">${Math.floor(Math.random()*100)}%</span>`;
      }
    };

    let totalAssigned = 0;
    
    const accordionsHtml = classes.map((cls, idx) => {
      // Pick 3-5 random candidates for this class
      const classCands = cands.slice(idx * 3, idx * 3 + Math.floor(Math.random() * 3 + 3));
      totalAssigned += classCands.length;
      
      const candsHtml = classCands.map(c => `
        <div style="border-bottom:1px solid var(--border-light); background:var(--bg-color);">
          <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${c.photo || 'https://via.placeholder.com/150'}" style="width:32px; height:32px; border-radius:50%; object-fit:cover; border:1px solid var(--border-color);">
              <div>
                <div style="font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:2px;">${c.name}</div>
                <div style="font-size:11px; color:var(--text-secondary);">ID: ${c.rollNo || c.id}</div>
              </div>
            </div>
            <div style="text-align:right; font-size:12px; color:var(--text-secondary);">
              ${getProgressHtml(c, type)}
            </div>
          </div>
          
          <!-- Practice Test Drill-down (Hidden initially) -->
          <div id="pt-review-${c.id}" style="display:none; padding:16px; background:var(--surface-color); border-top:1px solid var(--border-light);">
            <div style="font-weight:600; font-size:13px; margin-bottom:12px; color:var(--text-primary);">Reviewing Mistakes for ${c.name}</div>
            
            <div style="display:flex; flex-direction:column; gap:16px;">
              <div style="border:1px solid var(--status-error); border-radius:8px; padding:12px; background:var(--status-error-bg);">
                <div style="font-weight:600; font-size:13px; margin-bottom:8px;">Q3: What is the correct cooking temperature for poultry?</div>
                <div style="font-size:12px; margin-bottom:4px; color:var(--status-error);"><span style="font-weight:600;">Candidate Answer:</span> 145°F (63°C)</div>
                <div style="font-size:12px; color:var(--status-success);"><span style="font-weight:600;">Correct Answer:</span> 165°F (74°C) for 15 seconds</div>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      return `
        <div style="border:1px solid var(--border-color); border-radius:8px; margin-bottom:12px; overflow:hidden; background:var(--surface-color);">
          <div style="padding:16px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#f8fafc;" onclick="const content = this.nextElementSibling; const icon = this.querySelector('.chevron-icon'); if(content.style.display==='none'){content.style.display='block'; icon.style.transform='rotate(180deg)';}else{content.style.display='none'; icon.style.transform='rotate(0deg)';}">
            <div style="font-weight:600; font-size:14px; display:flex; align-items:center; gap:8px;">
              <i class="material-icons-outlined" style="font-size:18px; color:var(--brand-primary);">class</i> ${cls}
            </div>
            <div style="display:flex; align-items:center; gap:12px; font-size:12px; color:var(--text-secondary);">
              <span>${classCands.length} Candidates</span>
              <i class="material-icons chevron-icon" style="transition: transform 0.2s; font-size:20px;">expand_more</i>
            </div>
          </div>
          <div style="display:none; border-top:1px solid var(--border-light);">
            ${candsHtml}
          </div>
        </div>
      `;
    }).join('');

    // Tab 1: Analytics
    document.getElementById('mm-tab-analytics').innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:24px;">
        <div class="card" style="display:flex; align-items:center; justify-content:space-between; padding:24px;">
          <div>
            <div style="font-size:13px; color:var(--text-secondary); text-transform:uppercase; font-weight:600; margin-bottom:4px;">Total Assigned</div>
            <div style="font-size:28px; font-weight:800; color:var(--text-primary);">${totalAssigned} Candidates</div>
          </div>
          <i class="material-icons-outlined" style="font-size:32px; color:var(--border-color);">groups</i>
        </div>
        <div class="card" style="display:flex; align-items:center; justify-content:space-between; padding:24px;">
          <div>
            <div style="font-size:13px; color:var(--text-secondary); text-transform:uppercase; font-weight:600; margin-bottom:4px;">Avg. Completion</div>
            <div style="font-size:28px; font-weight:800; color:var(--brand-primary);">42%</div>
          </div>
          <i class="material-icons-outlined" style="font-size:32px; color:var(--brand-primary);">trending_up</i>
        </div>
      </div>
      <div>
        <h3 style="font-size:16px; margin-bottom:16px; border-bottom:1px solid var(--border-light); padding-bottom:8px;">Classes Using This Material</h3>
        ${accordionsHtml}
      </div>
    `;

    // Tab 2: Preview (using iframe to load learning_material.html directly)
    document.getElementById('mm-tab-preview').innerHTML = `
      <iframe src="learning_material.html" style="width:100%; height:800px; border:1px solid var(--border-color); border-radius:12px; display:block;"></iframe>
    `;
  },

  closeDrawer() {
    document.getElementById('drawer-overlay').classList.remove('open');
    document.getElementById('universal-drawer').classList.remove('open');
  },

  // ==========================================================================
  // UTILITIES
  // ==========================================================================
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'check_circle';
    if (type === 'error') icon = 'error';
    if (type === 'warning') icon = 'warning';
    if (type === 'info') icon = 'info';

    toast.innerHTML = `<i class="material-icons-outlined">${icon}</i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  simulateCsvUpload() {
    this.showToast('Uploading CSV...', 'info');
    setTimeout(() => {
      this.fetchData(); // Re-fetch to simulate new data arrival
      this.showToast('Import successful. Candidates refreshed.', 'success');
    }, 1500);
  },

  assignVoucher(candId) {
    this.showToast('Voucher Code generation requested...', 'info');
    setTimeout(() => {
      // Optimistic mock update for UI
      const cand = this.state.candidates.find(c => c.id === candId);
      if (cand) cand.voucherCode = 'VCH-' + Math.floor(Math.random()*10000);
      this.renderCandidates('all');
      this.openCandidateDrawer(candId); // Refresh drawer
      this.showToast('Voucher Code successfully assigned.', 'success');
    }, 800);
  }
,

  confirmStartExam(id) {
    const session = this.state.sessions.find(s => s.id === id);
    if (!session) return;
    const candCount = session.candidateCount || 40; // Defaulting to 40 for demo to show >35 warning
    
    let assistantHtml = '';
    if (candCount > 35) {
      assistantHtml = `
        <div style="background:var(--status-warning-bg); border:1px solid var(--status-warning); padding:12px; border-radius:8px; margin-bottom:16px;">
          <div style="font-size:13px; font-weight:600; color:var(--status-warning); margin-bottom:4px;"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">warning</i> Assistant Proctor Required</div>
          <div style="font-size:12px; color:var(--status-warning); margin-bottom:12px;">This class has more than 35 candidates. You must provide an Assistant Proctor ID to proceed.</div>
          <input type="text" placeholder="Assistant Proctor ID" id="assistant-proctor-code" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--surface-color);">
        </div>
      `;
    }

    const modalHtml = `
      <div class="batch-modal-overlay open" id="start-exam-modal" onclick="if(event.target === this) this.remove()">
        <div class="batch-modal-content" style="max-width: 500px;">
          <h2 style="font-size:20px; font-weight:600; margin:0 0 16px 0;">Start Exam Confirmation</h2>
          <p style="font-size:14px; color:var(--text-secondary); margin-bottom:24px;">Are you sure you want to start the exam? Once started, candidates will be able to begin and the timer will commence. Please ensure all candidates are present and physical IDs have been verified.</p>
          ${assistantHtml}
          <div style="display:flex; gap:12px; justify-content:flex-end;">
            <button class="btn btn-secondary" onclick="document.getElementById('start-exam-modal').remove()">Cancel</button>
            <button class="btn btn-primary" style="background:var(--status-success); color:var(--status-success-ct); border-color:var(--status-success);" onclick="
              ${candCount > 35 ? `if(!document.getElementById('assistant-proctor-code').value) { v3App.showToast('Please enter Assistant Proctor ID.', 'error'); return; }` : ''}
              document.getElementById('start-exam-modal').remove(); v3App.switchView('monitoring');
            ">Confirm & Start Exam</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  openSessionSupervisor(cId) {
    let c = this.state.monitorState.candidates.find(x => x.id === cId) || this.state.candidates.find(x => x.id === cId);
    if(!c) return;

    let overlay = document.getElementById('session-supervisor-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'session-supervisor-modal';
      overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:center; justify-content:center;';
      document.body.appendChild(overlay);
    }
    
    // The exact UI styling from the user's screenshot
    overlay.innerHTML = `
      <div style="background:var(--surface-color); color:var(--text-primary); width:450px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); overflow:hidden; font-family:var(--font-sans);">
        
        <!-- Header -->
        <div style="padding:16px 24px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color);">
          <h2 style="font-size:16px; margin:0; font-weight:700; display:flex; align-items:center; gap:8px;">
            <i class="material-icons" style="color:var(--brand-primary); font-size:18px;">videocam</i> Candidate Class Supervisor
          </h2>
          <button onclick="document.getElementById('session-supervisor-modal').style.display='none'" style="background:transparent; border:none; cursor:pointer; font-size:18px; color:var(--text-tertiary);">&times;</button>
        </div>
        
        <div style="padding:24px;">
          <!-- Candidate Info -->
          <div style="background:var(--bg-color); padding:16px; border-radius:8px; display:flex; align-items:center; gap:16px; margin-bottom:24px;">
            <img src="${c.photo || 'https://via.placeholder.com/150'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
            <div>
              <div style="font-weight:700; font-size:14px; color:var(--text-primary);">${c.name}</div>
              <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">Exam Class • ID: ${c.id}</div>
            </div>
          </div>
          
          <!-- 1. Dispatch Preset Direct Warning -->
          <h3 style="font-size:13px; font-weight:700; margin-bottom:12px; color:var(--text-primary);">1. Dispatch Preset Direct Warning</h3>
          <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:24px;">
            <button onclick="v3App.showToast('Warning sent', 'warning'); document.getElementById('session-supervisor-modal').style.display='none'" style="display:flex; align-items:center; justify-content:flex-start; text-align:left; background:var(--surface-color); border:1px solid var(--brand-primary); color:var(--text-primary); padding:10px 12px; border-radius:6px; font-size:13px; cursor:pointer;">
              <i class="material-icons-outlined" style="color:var(--text-secondary); font-size:16px; margin-right:12px;">visibility</i>
              "Keep eyes aligned with exam window"
            </button>
            <button onclick="v3App.showToast('Warning sent', 'warning'); document.getElementById('session-supervisor-modal').style.display='none'" style="display:flex; align-items:center; justify-content:flex-start; text-align:left; background:var(--surface-color); border:1px solid var(--brand-primary); color:var(--text-primary); padding:10px 12px; border-radius:6px; font-size:13px; cursor:pointer;">
              <i class="material-icons-outlined" style="color:var(--text-secondary); font-size:16px; margin-right:12px;">volume_off</i>
              "Testing room must remain silent"
            </button>
            <button onclick="v3App.showToast('Warning sent', 'warning'); document.getElementById('session-supervisor-modal').style.display='none'" style="display:flex; align-items:center; justify-content:flex-start; text-align:left; background:var(--surface-color); border:1px solid var(--brand-primary); color:var(--text-primary); padding:10px 12px; border-radius:6px; font-size:13px; cursor:pointer;">
              <i class="material-icons-outlined" style="color:var(--text-secondary); font-size:16px; margin-right:12px;">fullscreen</i>
              "Return to primary full-screen"
            </button>
            
            <div style="display:flex; gap:8px; margin-top:4px;">
              <input type="text" style="flex:1; padding:10px 12px; border-radius:6px; border:1px solid var(--border-color); font-size:13px; outline:none;" placeholder="Type a custom warning message">
              <button style="background:var(--brand-primary); color:var(--on-pri); border:none; padding:10px 16px; border-radius:6px; font-weight:600; cursor:pointer;" onclick="v3App.showToast('Custom warning sent.', 'success'); document.getElementById('session-supervisor-modal').style.display='none'">Send</button>
            </div>
          </div>
          
          <!-- 2. Direct Session Controls -->
          <h3 style="font-size:13px; font-weight:700; margin-bottom:12px; color:var(--text-primary);">2. Direct Class Controls</h3>
          <div style="display:flex; gap:12px; margin-bottom:24px;">
            <button onclick="v3App.showToast('Exam paused.', 'warning'); document.getElementById('session-supervisor-modal').style.display='none'" style="flex:1; display:flex; justify-content:center; align-items:center; background:var(--surface-color); border:1px solid var(--brand-primary); color:var(--text-primary); padding:10px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer;">
              <i class="material-icons" style="color:var(--text-primary); font-size:16px; margin-right:8px;">pause</i> Pause Exam
            </button>
            <button onclick="v3App.showToast('Feed suspended.', 'error'); document.getElementById('session-supervisor-modal').style.display='none'" style="flex:1; display:flex; justify-content:center; align-items:center; background:var(--surface-color); border:1px solid var(--status-error); color:var(--status-error); padding:10px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer;">
              <i class="material-icons-outlined" style="font-size:16px; margin-right:8px;">cancel</i> Suspend Feed
            </button>
          </div>
          
          <!-- 3. Support Escalation Channels -->
          <h3 style="font-size:13px; font-weight:700; margin-bottom:12px; color:var(--text-primary);">3. Support Escalation Channels</h3>
          <div style="display:flex; gap:12px;">
            <button onclick="v3App.showToast('IT Support notified.', 'info'); document.getElementById('session-supervisor-modal').style.display='none'" style="flex:1; display:flex; justify-content:center; align-items:center; background:var(--surface-color); border:1px solid var(--brand-primary); color:var(--text-primary); padding:10px; border-radius:6px; font-size:13px; cursor:pointer;">
              <i class="material-icons-outlined" style="color:var(--text-secondary); font-size:16px; margin-right:8px;">build</i> IT Support
            </button>
            <button onclick="v3App.showToast('Alert Chairman notified.', 'info'); document.getElementById('session-supervisor-modal').style.display='none'" style="flex:1; display:flex; justify-content:center; align-items:center; background:var(--surface-color); border:1px solid var(--brand-primary); color:var(--text-primary); padding:10px; border-radius:6px; font-size:13px; cursor:pointer;">
              <i class="material-icons-outlined" style="color:var(--text-secondary); font-size:16px; margin-right:8px;">person</i> Alert Chairman
            </button>
          </div>
        </div>
      </div>
    `;
    overlay.style.display = 'flex';
  }

};

document.addEventListener('DOMContentLoaded', () => {
  v3App.init();
});
