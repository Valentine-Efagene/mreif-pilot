{{- define "mofi-local.name" -}}
{{- .Chart.Name -}}
{{- end -}}

{{- define "mofi-local.labels" -}}
app.kubernetes.io/name: {{ include "mofi-local.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "mofi-local.selectorLabels" -}}
app.kubernetes.io/name: {{ include "mofi-local.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "mofi-local.mysqlHost" -}}
mysql
{{- end -}}

{{- define "mofi-local.redisHost" -}}
redis
{{- end -}}

{{- define "mofi-local.minioHost" -}}
minio
{{- end -}}

{{- define "mofi-local.rabbitmqHost" -}}
rabbitmq
{{- end -}}
